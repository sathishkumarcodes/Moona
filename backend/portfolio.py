"""
Portfolio calculation and analytics endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict
import logging
import asyncio
from auth import get_current_user_dependency, UserData
from db_supabase import get_db_pool, execute_query
from price_service import price_service
import httpx

logger = logging.getLogger(__name__)

portfolio_router = APIRouter(prefix="/portfolio", tags=["portfolio"])

class PortfolioSummary(BaseModel):
    costBasis: float
    currentValue: float
    gainLoss: float
    returnPct: float
    totalHoldings: int
    totalReturnPct: float
    bestPerformer: Optional[Dict]
    assetTypeCount: int
    lastUpdated: str

class TimeSeriesPoint(BaseModel):
    date: str
    value: float

class PortfolioPerformance(BaseModel):
    portfolioPerformance: List[TimeSeriesPoint]
    assetTypePerformance: List[Dict]
    monthlyContributions: List[TimeSeriesPoint]
    portfolioVsSpy: List[Dict]

class AllocationData(BaseModel):
    assetTypeAllocation: List[Dict]
    sectorAllocation: List[Dict]
    allocationSummary: Dict

class SPYComparison(BaseModel):
    spyValue: float
    spyReturnPct: float
    outperformancePct: float
    outperformanceValue: float
    portfolioValue: float
    portfolioReturnPct: float

async def calculate_portfolio_metrics(user_id: str) -> Dict:
    """Calculate all portfolio metrics from holdings"""
    try:
        # Skip if user_id is a mock user (not a valid UUID)
        if user_id == "mock_user_123" or len(user_id) < 32:
            return {
                "costBasis": 0.0,
                "currentValue": 0.0,
                "gainLoss": 0.0,
                "returnPct": 0.0,
                "totalHoldings": 0,
                "assetTypes": set(),
                "holdings": []
            }
        
        pool = await get_db_pool()
        
        # Fetch all holdings
        holdings = await execute_query(
            "SELECT * FROM holdings WHERE user_id = $1",
            user_id
        )
        
        if not holdings:
            return {
                "costBasis": 0.0,
                "currentValue": 0.0,
                "gainLoss": 0.0,
                "returnPct": 0.0,
                "totalHoldings": 0,
                "assetTypes": set(),
                "holdings": []
            }
        
        # Get current prices with timeout
        symbols = [h['symbol'] for h in holdings]
        asset_types = {h['symbol']: h['type'] if h['type'] != 'roth_ira' else 'stock' for h in holdings}
        try:
            price_data = await asyncio.wait_for(
                price_service.get_multiple_prices(symbols, asset_types),
                timeout=10.0  # 10 second timeout
            )
        except asyncio.TimeoutError:
            logger.warning("Price fetching timed out, using existing prices from database")
            price_data = {}
        
        # Calculate totals
        total_cost = 0.0
        total_value = 0.0
        asset_types_set = set()
        best_performer = None
        best_return = float('-inf')
        
        updated_holdings = []
        for holding in holdings:
            symbol = holding['symbol']
            
            # Get current price - handle both dict and float responses
            price_info = price_data.get(symbol, {})
            if isinstance(price_info, dict):
                current_price = float(price_info.get('price', price_info.get('current_price', holding.get('current_price', 0))))
            else:
                current_price = float(price_info) if price_info else float(holding.get('current_price', 0))
            
            # Convert database Decimal types to float
            total_cost_holding = float(holding['total_cost'])
            shares = float(holding['shares'])
            total_value_holding = shares * current_price
            
            gain_loss = total_value_holding - total_cost_holding
            return_pct = (gain_loss / total_cost_holding * 100) if total_cost_holding > 0 else 0
            
            total_cost += total_cost_holding
            total_value += total_value_holding
            asset_types_set.add(holding['type'])
            
            if return_pct > best_return:
                best_return = return_pct
                best_performer = {
                    "name": holding['name'],
                    "symbol": holding['symbol'],
                    "returnPct": return_pct,
                    "gainLoss": gain_loss,
                    "value": total_value_holding
                }
            
            # Convert all Decimal values to float for JSON serialization
            updated_holdings.append({
                "id": str(holding.get('id', '')),
                "symbol": holding.get('symbol', ''),
                "name": holding.get('name', ''),
                "type": holding.get('type', ''),
                "shares": shares,
                "avg_cost": float(holding.get('avg_cost', 0)),
                "current_price": current_price,
                "total_value": total_value_holding,
                "total_cost": total_cost_holding,
                "gain_loss": gain_loss,
                "gain_loss_percent": return_pct,
                "sector": holding.get('sector'),
                "platform": holding.get('platform'),
                "last_updated": holding.get('last_updated'),
                "created_at": holding.get('created_at')
            })
        
        total_gain_loss = total_value - total_cost
        total_return_pct = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0
        
        return {
            "costBasis": total_cost,
            "currentValue": total_value,
            "gainLoss": total_gain_loss,
            "returnPct": total_return_pct,
            "totalHoldings": len(holdings),
            "assetTypes": asset_types_set,
            "bestPerformer": best_performer,
            "holdings": updated_holdings
        }
    except Exception as e:
        logger.error(f"Error calculating portfolio metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate portfolio: {str(e)}")

async def get_spy_data() -> Dict:
    """Get SPY (S&P 500) benchmark data"""
    try:
        # Get current SPY price
        spy_price_data = await price_service.get_price("SPY", "stock")
        current_spy_price = spy_price_data.get("price", 0)
        
        # For simplicity, assume SPY baseline (can be enhanced with historical data)
        # Using a typical SPY return of ~10% annually as baseline
        spy_baseline = current_spy_price * 0.9  # Approximate 10% gain
        spy_return_pct = 10.0  # Placeholder - can be calculated from historical data
        
        return {
            "spyValue": current_spy_price,
            "spyReturnPct": spy_return_pct,
            "spyBaseline": spy_baseline
        }
    except Exception as e:
        logger.warning(f"Failed to fetch SPY data: {str(e)}")
        return {
            "spyValue": 0.0,
            "spyReturnPct": 0.0,
            "spyBaseline": 0.0
        }

@portfolio_router.get("/summary")
async def get_portfolio_summary(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get portfolio summary with all KPIs"""
    try:
        metrics = await calculate_portfolio_metrics(current_user.id)
        
        return PortfolioSummary(
            costBasis=metrics["costBasis"],
            currentValue=metrics["currentValue"],
            gainLoss=metrics["gainLoss"],
            returnPct=metrics["returnPct"],
            totalHoldings=metrics["totalHoldings"],
            totalReturnPct=metrics["returnPct"],
            bestPerformer=metrics.get("bestPerformer"),
            assetTypeCount=len(metrics["assetTypes"]),
            lastUpdated=datetime.now(timezone.utc).isoformat()
        )
    except Exception as e:
        logger.error(f"Error getting portfolio summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio summary: {str(e)}")

@portfolio_router.get("/performance")
async def get_portfolio_performance(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get time-series performance data"""
    try:
        metrics = await calculate_portfolio_metrics(current_user.id)
        
        # Generate time series (last 12 months)
        portfolio_performance = []
        asset_type_performance = {}
        monthly_contributions = []
        
        # Group holdings by asset type
        asset_types = {}
        for holding in metrics["holdings"]:
            asset_type = holding.get("type", "stock")
            if asset_type not in asset_types:
                asset_types[asset_type] = []
            asset_types[asset_type].append(holding)
        
        # Generate monthly data points
        now = datetime.now(timezone.utc)
        for i in range(12):
            date = now - timedelta(days=30 * (11 - i))
            date_str = date.strftime("%Y-%m-%d")
            
            # Portfolio value (simplified - using current value with slight variation)
            portfolio_value = metrics["currentValue"] * (1 + (i * 0.02))  # Approximate growth
            portfolio_performance.append({
                "date": date_str,
                "value": portfolio_value
            })
            
            # Asset type performance
            for asset_type, holdings_list in asset_types.items():
                if asset_type not in asset_type_performance:
                    asset_type_performance[asset_type] = []
                type_value = sum(h.get("total_value", 0) for h in holdings_list) * (1 + (i * 0.02))
                asset_type_performance[asset_type].append({
                    "date": date_str,
                    "value": type_value
                })
            
            # Monthly contributions (placeholder - can be enhanced)
            monthly_contributions.append({
                "date": date_str,
                "value": metrics["costBasis"] / 12  # Evenly distributed
            })
        
        # Convert asset type performance to list format
        asset_type_perf_list = [
            {
                "assetType": asset_type,
                "data": data
            }
            for asset_type, data in asset_type_performance.items()
        ]
        
        # Portfolio vs SPY
        spy_data = await get_spy_data()
        portfolio_vs_spy = []
        for i in range(12):
            date = now - timedelta(days=30 * (11 - i))
            date_str = date.strftime("%Y-%m-%d")
            portfolio_vs_spy.append({
                "date": date_str,
                "portfolio": metrics["currentValue"] * (1 + (i * 0.02)),
                "spy": spy_data["spyValue"] * (1 + (i * 0.015))
            })
        
        return PortfolioPerformance(
            portfolioPerformance=portfolio_performance,
            assetTypePerformance=asset_type_perf_list,
            monthlyContributions=monthly_contributions,
            portfolioVsSpy=portfolio_vs_spy
        )
    except Exception as e:
        logger.error(f"Error getting portfolio performance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance: {str(e)}")

@portfolio_router.get("/allocation")
async def get_portfolio_allocation(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get allocation data (asset types, sectors)"""
    try:
        metrics = await calculate_portfolio_metrics(current_user.id)
        
        # Asset type allocation
        asset_type_allocation = []
        asset_type_totals = {}
        
        for holding in metrics["holdings"]:
            asset_type = holding.get("type", "stock")
            value = holding.get("total_value", 0)
            if asset_type not in asset_type_totals:
                asset_type_totals[asset_type] = 0
            asset_type_totals[asset_type] += value
        
        total_portfolio_value = metrics["currentValue"]
        for asset_type, value in asset_type_totals.items():
            percentage = (value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
            asset_type_allocation.append({
                "assetType": asset_type,
                "value": value,
                "percentage": percentage
            })
        
        # Sector allocation
        sector_allocation = []
        sector_totals = {}
        
        for holding in metrics["holdings"]:
            sector = holding.get("sector", "Unknown")
            value = holding.get("total_value", 0)
            if sector not in sector_totals:
                sector_totals[sector] = 0
            sector_totals[sector] += value
        
        for sector, value in sector_totals.items():
            percentage = (value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
            sector_allocation.append({
                "sector": sector,
                "value": value,
                "percentage": percentage
            })
        
        # Allocation summary
        by_asset_type = ", ".join([
            f"{at['assetType']} ({at['percentage']:.1f}%)"
            for at in asset_type_allocation
        ]) if asset_type_allocation else "No holdings"
        
        # Risk profile (simplified)
        risk_profile = {
            "highRisk": sum(at["percentage"] for at in asset_type_allocation if at["assetType"] == "crypto"),
            "mediumRisk": sum(at["percentage"] for at in asset_type_allocation if at["assetType"] == "stock"),
            "lowRisk": sum(at["percentage"] for at in asset_type_allocation if at["assetType"] in ["roth_ira", "etf"])
        }
        
        # Largest holding
        largest_holding = None
        if metrics["holdings"]:
            largest = max(metrics["holdings"], key=lambda h: h.get("total_value", 0))
            largest_pct = (largest.get("total_value", 0) / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
            largest_holding = {
                "name": largest.get("name", ""),
                "percentage": largest_pct
            }
        
        allocation_summary = {
            "byAssetType": by_asset_type,
            "riskProfile": risk_profile,
            "diversification": {
                "totalAssets": metrics["totalHoldings"],
                "sectors": len(sector_totals),
                "largestHolding": largest_holding
            }
        }
        
        return AllocationData(
            assetTypeAllocation=asset_type_allocation,
            sectorAllocation=sector_allocation,
            allocationSummary=allocation_summary
        )
    except Exception as e:
        logger.error(f"Error getting portfolio allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get allocation: {str(e)}")

@portfolio_router.get("/spy-comparison")
async def get_spy_comparison(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get SPY comparison data"""
    try:
        metrics = await calculate_portfolio_metrics(current_user.id)
        spy_data = await get_spy_data()
        
        portfolio_value = metrics["currentValue"]
        portfolio_return = metrics["returnPct"]
        
        # Calculate outperformance
        outperformance_pct = portfolio_return - spy_data["spyReturnPct"]
        outperformance_value = portfolio_value - (metrics["costBasis"] * (1 + spy_data["spyReturnPct"] / 100))
        
        return SPYComparison(
            spyValue=spy_data["spyValue"],
            spyReturnPct=spy_data["spyReturnPct"],
            outperformancePct=outperformance_pct,
            outperformanceValue=outperformance_value,
            portfolioValue=portfolio_value,
            portfolioReturnPct=portfolio_return
        )
    except Exception as e:
        logger.error(f"Error getting SPY comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get SPY comparison: {str(e)}")

@portfolio_router.get("/top-performers")
async def get_top_performers(
    limit: int = 5,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get top performing holdings"""
    try:
        metrics = await calculate_portfolio_metrics(current_user.id)
        
        # Sort by return percentage
        sorted_holdings = sorted(
            metrics["holdings"],
            key=lambda h: h.get("gain_loss_percent", 0),
            reverse=True
        )
        
        top_performers = sorted_holdings[:limit]
        
        return [
            {
                "symbol": h.get("symbol"),
                "name": h.get("name"),
                "returnPct": h.get("gain_loss_percent", 0),
                "value": h.get("total_value", 0),
                "gainLoss": h.get("gain_loss", 0)
            }
            for h in top_performers
        ]
    except Exception as e:
        logger.error(f"Error getting top performers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get top performers: {str(e)}")

