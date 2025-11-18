"""
API endpoints for Portfolio Intelligence / Daily Insights
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel

from auth import get_current_user_dependency, UserData
from portfolio import calculate_portfolio_metrics
from insight_service import calculate_daily_attribution, generate_insight_narrative

logger = logging.getLogger(__name__)

insights_router = APIRouter(prefix="/api/insights", tags=["insights"])

class DailyInsightResponse(BaseModel):
    date: str
    headline: str
    details: str
    keyDrivers: list[str]
    attribution: dict
    changePct: float
    changeValue: float

@insights_router.get("/daily")
async def get_daily_insight(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format, defaults to today"),
    current_user: UserData = Depends(get_current_user_dependency)
):
    """
    Get daily portfolio insight with attribution and narrative explanation
    """
    try:
        # Parse date or use today
        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        else:
            target_date = datetime.now().date()
        
        # Get current portfolio metrics
        current_metrics = await calculate_portfolio_metrics(current_user.id)
        current_holdings = current_metrics.get("holdings", [])
        
        # For now, we'll use current holdings vs cost basis as "previous"
        # In a production system, you'd store daily snapshots
        # Calculate attribution using current vs cost basis
        attribution = calculate_daily_attribution(
            current_holdings=current_holdings,
            previous_holdings=None,  # Will use cost basis
            previous_total_value=None  # Will calculate from cost basis
        )
        
        # Generate narrative insight
        narrative = generate_insight_narrative(attribution)
        
        return DailyInsightResponse(
            date=target_date.strftime("%Y-%m-%d"),
            headline=narrative["headline"],
            details=narrative["details"],
            keyDrivers=narrative["keyDrivers"],
            attribution=attribution.to_dict(),
            changePct=attribution.change_pct,
            changeValue=attribution.change_value
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting daily insight: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insight: {str(e)}")

@insights_router.get("/weekly")
async def get_weekly_insight(
    current_user: UserData = Depends(get_current_user_dependency)
):
    """
    Get weekly portfolio insight summary
    """
    try:
        # Get current portfolio metrics
        current_metrics = await calculate_portfolio_metrics(current_user.id)
        current_holdings = current_metrics.get("holdings", [])
        
        # Calculate weekly attribution (7 days ago vs today)
        # For now, use current vs cost basis as approximation
        attribution = calculate_daily_attribution(
            current_holdings=current_holdings,
            previous_holdings=None,
            previous_total_value=None
        )
        
        # Generate narrative
        narrative = generate_insight_narrative(attribution)
        
        # Modify headline for weekly
        weekly_headline = narrative["headline"].replace("today", "this week")
        weekly_details = narrative["details"].replace("today", "this week")
        
        return DailyInsightResponse(
            date=datetime.now().strftime("%Y-%m-%d"),
            headline=weekly_headline,
            details=weekly_details,
            keyDrivers=narrative["keyDrivers"],
            attribution=attribution.to_dict(),
            changePct=attribution.change_pct,
            changeValue=attribution.change_value
        )
    
    except Exception as e:
        logger.error(f"Error getting weekly insight: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate weekly insight: {str(e)}")

