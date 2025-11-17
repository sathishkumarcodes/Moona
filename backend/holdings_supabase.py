"""
Holdings management using Supabase PostgreSQL
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional
import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from auth_supabase import get_current_user_dependency, UserData
from price_service import price_service
from db_supabase import get_db_pool, execute_one, execute_insert, execute_update, execute_query, execute_update

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

holdings_router = APIRouter(prefix="/holdings", tags=["holdings"])

class HoldingCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., pattern="^(stock|crypto|roth_ira)$")
    shares: float = Field(..., gt=0)
    avg_cost: float = Field(..., gt=0)
    sector: Optional[str] = Field(None, max_length=100)
    platform: Optional[str] = Field(None, max_length=100)

class HoldingUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    shares: Optional[float] = Field(None, gt=0)
    avg_cost: Optional[float] = Field(None, gt=0)
    sector: Optional[str] = Field(None, max_length=100)
    platform: Optional[str] = Field(None, max_length=100)

class HoldingResponse(BaseModel):
    id: str
    symbol: str
    name: str
    type: str
    shares: float
    avg_cost: float
    current_price: float
    total_value: float
    total_cost: float
    gain_loss: float
    gain_loss_percent: float
    sector: Optional[str]
    platform: Optional[str]
    last_updated: datetime
    created_at: datetime

def holding_to_dict(holding) -> dict:
    """Convert database row to HoldingResponse dict"""
    return {
        "id": str(holding['id']),
        "symbol": holding['symbol'],
        "name": holding['name'],
        "type": holding['type'],
        "shares": float(holding['shares']),
        "avg_cost": float(holding['avg_cost']),
        "current_price": float(holding['current_price']),
        "total_value": float(holding['total_value']),
        "total_cost": float(holding['total_cost']),
        "gain_loss": float(holding['gain_loss']),
        "gain_loss_percent": float(holding['gain_loss_percent']),
        "sector": holding.get('sector'),
        "platform": holding.get('platform'),
        "last_updated": holding['last_updated'],
        "created_at": holding['created_at']
    }

@holdings_router.post("", response_model=HoldingResponse)
async def create_holding(
    holding_data: HoldingCreate,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Create a new holding with real-time price"""
    try:
        pool = await get_db_pool()
        
        # Get current price for the symbol
        price_data = await price_service.get_price(
            holding_data.symbol, 
            holding_data.type if holding_data.type != 'roth_ira' else 'stock'
        )
        
        if "error" in price_data:
            raise HTTPException(status_code=400, detail=f"Could not fetch price: {price_data['error']}")
        
        current_price = price_data["price"]
        
        # Calculate values
        total_value = holding_data.shares * current_price
        total_cost = holding_data.shares * holding_data.avg_cost
        gain_loss = total_value - total_cost
        gain_loss_percent = (gain_loss / total_cost) * 100 if total_cost > 0 else 0
        
        # Insert holding
        holding = await execute_insert(
            """INSERT INTO holdings 
               (user_id, symbol, name, type, shares, avg_cost, current_price, total_value, 
                total_cost, gain_loss, gain_loss_percent, sector, platform)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
               RETURNING *""",
            current_user.id,
            holding_data.symbol.upper(),
            holding_data.name,
            holding_data.type,
            holding_data.shares,
            holding_data.avg_cost,
            current_price,
            total_value,
            total_cost,
            gain_loss,
            gain_loss_percent,
            holding_data.sector,
            holding_data.platform
        )
        
        return HoldingResponse(**holding_to_dict(holding))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating holding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create holding: {str(e)}")

@holdings_router.get("", response_model=List[HoldingResponse])
async def get_holdings(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get all holdings for current user with updated prices"""
    try:
        pool = await get_db_pool()
        
        # Fetch user's holdings
        holdings = await execute_query(
            "SELECT * FROM holdings WHERE user_id = $1 ORDER BY created_at DESC",
            current_user.id
        )
        
        if not holdings:
            return []
        
        # Get symbols and types for batch price update
        symbols = [h['symbol'] for h in holdings]
        asset_types = {h['symbol']: h['type'] if h['type'] != 'roth_ira' else 'stock' for h in holdings}
        
        # Fetch current prices
        price_data = await price_service.get_multiple_prices(symbols, asset_types)
        
        # Update holdings with current prices
        updated_holdings = []
        for holding in holdings:
            symbol = holding['symbol']
            
            # Get price data for this symbol
            current_price_data = price_data.get(symbol, {})
            
            if "error" not in current_price_data and "price" in current_price_data:
                # Update with current price
                current_price = current_price_data["price"]
                total_value = holding['shares'] * current_price
                gain_loss = total_value - holding['total_cost']
                gain_loss_percent = (gain_loss / holding['total_cost']) * 100 if holding['total_cost'] > 0 else 0
                
                # Update in database
                await execute_update(
                    """UPDATE holdings SET 
                       current_price = $1, total_value = $2, gain_loss = $3, 
                       gain_loss_percent = $4, last_updated = NOW()
                       WHERE id = $5""",
                    current_price, total_value, gain_loss, gain_loss_percent, holding['id']
                )
                
                # Update holding dict
                holding['current_price'] = current_price
                holding['total_value'] = total_value
                holding['gain_loss'] = gain_loss
                holding['gain_loss_percent'] = gain_loss_percent
                holding['last_updated'] = datetime.now(timezone.utc)
            
            updated_holdings.append(HoldingResponse(**holding_to_dict(holding)))
        
        return updated_holdings
    except Exception as e:
        logger.error(f"Error fetching holdings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch holdings: {str(e)}")

@holdings_router.get("/{holding_id}", response_model=HoldingResponse)
async def get_holding(
    holding_id: str,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get specific holding by ID"""
    try:
        pool = await get_db_pool()
        
        holding = await execute_one(
            "SELECT * FROM holdings WHERE id = $1 AND user_id = $2",
            holding_id,
            current_user.id
        )
        
        if not holding:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        # Update price
        asset_type = holding['type'] if holding['type'] != 'roth_ira' else 'stock'
        price_data = await price_service.get_price(holding['symbol'], asset_type)
        
        if "error" not in price_data and "price" in price_data:
            current_price = price_data["price"]
            total_value = holding['shares'] * current_price
            gain_loss = total_value - holding['total_cost']
            gain_loss_percent = (gain_loss / holding['total_cost']) * 100 if holding['total_cost'] > 0 else 0
            
            await execute_update(
                """UPDATE holdings SET 
                   current_price = $1, total_value = $2, gain_loss = $3, 
                   gain_loss_percent = $4, last_updated = NOW()
                   WHERE id = $5""",
                current_price, total_value, gain_loss, gain_loss_percent, holding_id
            )
            
            holding['current_price'] = current_price
            holding['total_value'] = total_value
            holding['gain_loss'] = gain_loss
            holding['gain_loss_percent'] = gain_loss_percent
            holding['last_updated'] = datetime.now(timezone.utc)
        
        return HoldingResponse(**holding_to_dict(holding))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching holding {holding_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch holding")

@holdings_router.put("/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: str,
    update_data: HoldingUpdate,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Update holding details"""
    try:
        pool = await get_db_pool()
        
        # Find existing holding
        existing_holding = await execute_one(
            "SELECT * FROM holdings WHERE id = $1 AND user_id = $2",
            holding_id,
            current_user.id
        )
        
        if not existing_holding:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        # Prepare update fields
        shares = update_data.shares if update_data.shares is not None else existing_holding['shares']
        avg_cost = update_data.avg_cost if update_data.avg_cost is not None else existing_holding['avg_cost']
        name = update_data.name if update_data.name is not None else existing_holding['name']
        sector = update_data.sector if update_data.sector is not None else existing_holding.get('sector')
        platform = update_data.platform if update_data.platform is not None else existing_holding.get('platform')
        
        # Get current price
        asset_type = existing_holding['type'] if existing_holding['type'] != 'roth_ira' else 'stock'
        price_data = await price_service.get_price(existing_holding['symbol'], asset_type)
        
        current_price = existing_holding['current_price']
        if "error" not in price_data and "price" in price_data:
            current_price = price_data["price"]
        
        # Recalculate values
        total_value = shares * current_price
        total_cost = shares * avg_cost
        gain_loss = total_value - total_cost
        gain_loss_percent = (gain_loss / total_cost) * 100 if total_cost > 0 else 0
        
        # Update in database
        await execute_update(
            """UPDATE holdings SET 
               name = $1, shares = $2, avg_cost = $3, current_price = $4,
               total_value = $5, total_cost = $6, gain_loss = $7, 
               gain_loss_percent = $8, sector = $9, platform = $10, last_updated = NOW()
               WHERE id = $11""",
            name, shares, avg_cost, current_price, total_value, total_cost,
            gain_loss, gain_loss_percent, sector, platform, holding_id
        )
        
        # Return updated holding
        updated_holding = await execute_one(
            "SELECT * FROM holdings WHERE id = $1",
            holding_id
        )
        
        return HoldingResponse(**holding_to_dict(updated_holding))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating holding {holding_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update holding: {str(e)}")

@holdings_router.delete("/{holding_id}")
async def delete_holding(
    holding_id: str,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Delete holding"""
    try:
        pool = await get_db_pool()
        
        result = await execute_update(
            "DELETE FROM holdings WHERE id = $1 AND user_id = $2",
            holding_id,
            current_user.id
        )
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Holding not found")
        
        return {"message": "Holding deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting holding {holding_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete holding")

@holdings_router.get("/search/{symbol}")
async def search_symbol(
    symbol: str,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Search for symbol and get current price"""
    try:
        # Get price data for symbol
        price_data = await price_service.get_price(symbol)
        
        if "error" in price_data:
            raise HTTPException(status_code=404, detail=price_data["error"])
        
        return {
            "symbol": symbol.upper(),
            "current_price": price_data["price"],
            "currency": price_data.get("currency", "USD"),
            "source": price_data.get("source", "unknown"),
            "last_updated": price_data.get("last_updated")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching symbol {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search symbol")

@holdings_router.get("/platforms/{asset_type}")
async def get_platforms_for_asset_type(
    asset_type: str,
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get available platforms for a specific asset type"""
    try:
        platforms = {
            "stock": [
                "Robinhood", "E*TRADE", "TD Ameritrade", "Charles Schwab",
                "Fidelity", "Interactive Brokers", "Webull", "M1 Finance",
                "Vanguard", "Merrill Lynch", "Ally Invest", "SoFi Invest",
                "Public", "Cash App Investing", "Other"
            ],
            "crypto": [
                "Coinbase", "Coinbase Pro", "Binance US", "Kraken", "Gemini",
                "KuCoin", "Crypto.com", "MetaMask", "Hardware Wallet (Ledger)",
                "Hardware Wallet (Trezor)", "Trust Wallet", "Exodus",
                "Atomic Wallet", "Cold Storage", "Other"
            ],
            "roth_ira": [
                "Fidelity IRA", "Vanguard IRA", "Charles Schwab IRA",
                "TD Ameritrade IRA", "E*TRADE IRA", "Merrill Lynch IRA",
                "Interactive Brokers IRA", "Ally Invest IRA", "Wealthfront IRA",
                "Betterment IRA", "M1 Finance IRA", "Other"
            ]
        }
        
        return {"platforms": platforms.get(asset_type, [])}
    except Exception as e:
        logger.error(f"Error getting platforms for {asset_type}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get platforms")

@holdings_router.get("/portfolio/summary")
async def get_portfolio_summary(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """Get portfolio summary with real-time calculations"""
    try:
        pool = await get_db_pool()
        
        holdings = await execute_query(
            "SELECT * FROM holdings WHERE user_id = $1",
            current_user.id
        )
        
        if not holdings:
            return {
                "total_value": 0,
                "total_cost": 0,
                "total_gain_loss": 0,
                "total_gain_loss_percent": 0,
                "asset_count": 0,
                "asset_breakdown": {
                    "stocks": 0,
                    "crypto": 0,
                    "roth_ira": 0
                }
            }
        
        # Get updated prices
        symbols = [h['symbol'] for h in holdings]
        asset_types = {h['symbol']: h['type'] if h['type'] in ['stock', 'crypto'] else 'stock' for h in holdings}
        price_data = await price_service.get_multiple_prices(symbols, asset_types)
        
        # Calculate totals with current prices
        total_value = 0
        total_cost = 0
        asset_breakdown = {"stock": 0, "crypto": 0, "roth_ira": 0}
        
        for holding in holdings:
            symbol = holding['symbol']
            current_price_data = price_data.get(symbol, {})
            
            if "error" not in current_price_data and "price" in current_price_data:
                current_price = current_price_data["price"]
            else:
                current_price = holding['current_price']
            
            holding_value = holding['shares'] * current_price
            holding_cost = holding['total_cost']
            
            total_value += holding_value
            total_cost += holding_cost
            
            # Map asset types correctly
            asset_type = holding['type']
            if asset_type in asset_breakdown:
                asset_breakdown[asset_type] += 1
            else:
                asset_breakdown["stock"] += 1
        
        total_gain_loss = total_value - total_cost
        total_gain_loss_percent = (total_gain_loss / total_cost) * 100 if total_cost > 0 else 0
        
        return {
            "total_value": total_value,
            "total_cost": total_cost,
            "total_gain_loss": total_gain_loss,
            "total_gain_loss_percent": total_gain_loss_percent,
            "asset_count": len(holdings),
            "asset_breakdown": {
                "stocks": asset_breakdown.get("stock", 0),
                "crypto": asset_breakdown.get("crypto", 0), 
                "roth_ira": asset_breakdown.get("roth_ira", 0)
            },
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error calculating portfolio summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate portfolio summary")

