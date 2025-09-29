import httpx
import asyncio
from pycoingecko import CoinGeckoAPI
from datetime import datetime
import logging
from typing import Dict, Optional
import os

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.cg = CoinGeckoAPI()
        
        # Alpha Vantage API key (optional, fallback to free APIs if not available)
        self.alpha_vantage_key = os.environ.get('ALPHA_VANTAGE_API_KEY')
        
        # Symbol mappings
        self.crypto_symbol_map = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum', 
            'SOL': 'solana',
            'ADA': 'cardano',
            'DOT': 'polkadot',
            'MATIC': 'polygon',
            'LINK': 'chainlink',
            'UNI': 'uniswap'
        }
    
    async def get_stock_price(self, symbol: str) -> Dict:
        """Get current stock price using free APIs"""
        try:
            # Use Alpha Vantage if API key is available
            if self.alpha_vantage_key:
                return await self._get_alpha_vantage_price(symbol)
            
            # Fallback to Yahoo Finance API (unofficial but free)
            return await self._get_yahoo_finance_price(symbol)
            
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
            return {"error": f"Could not fetch price for {symbol}"}
    
    async def _get_yahoo_finance_price(self, symbol: str) -> Dict:
        """Get stock price from Yahoo Finance (free, no API key required)"""
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
                response = await client.get(url, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                result = data['chart']['result'][0]
                meta = result['meta']
                
                current_price = meta['regularMarketPrice']
                prev_close = meta['previousClose']
                change = current_price - prev_close
                change_percent = (change / prev_close) * 100
                
                return {
                    "symbol": symbol,
                    "price": current_price,
                    "change": change,
                    "change_percent": change_percent,
                    "currency": meta.get('currency', 'USD'),
                    "last_updated": datetime.now().isoformat(),
                    "source": "yahoo_finance"
                }
                
        except Exception as e:
            logger.error(f"Yahoo Finance API error for {symbol}: {str(e)}")
            raise e
    
    async def _get_alpha_vantage_price(self, symbol: str) -> Dict:
        """Get stock price from Alpha Vantage (requires API key)"""
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://www.alphavantage.co/query"
                params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': self.alpha_vantage_key
                }
                
                response = await client.get(url, params=params, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                
                if 'Global Quote' not in data:
                    raise ValueError(f"Invalid response from Alpha Vantage for {symbol}")
                
                quote = data['Global Quote']
                current_price = float(quote['05. price'])
                change = float(quote['09. change'])
                change_percent = float(quote['10. change percent'].rstrip('%'))
                
                return {
                    "symbol": symbol,
                    "price": current_price,
                    "change": change,
                    "change_percent": change_percent,
                    "currency": "USD",
                    "last_updated": quote['07. latest trading day'],
                    "source": "alpha_vantage"
                }
                
        except Exception as e:
            logger.error(f"Alpha Vantage API error for {symbol}: {str(e)}")
            raise e
    
    def get_crypto_price(self, symbol: str) -> Dict:
        """Get crypto price from CoinGecko (free, no API key required)"""
        try:
            # Map symbol to CoinGecko ID
            coin_id = self.crypto_symbol_map.get(symbol.upper())
            if not coin_id:
                return {"error": f"Unsupported crypto symbol: {symbol}"}
            
            # Get current price data
            price_data = self.cg.get_price(
                ids=coin_id, 
                vs_currencies='usd', 
                include_24hr_change=True,
                include_24hr_vol=True
            )
            
            if coin_id not in price_data:
                return {"error": f"No data found for {symbol}"}
            
            coin_data = price_data[coin_id]
            current_price = coin_data['usd']
            change_24h = coin_data.get('usd_24h_change', 0)
            volume_24h = coin_data.get('usd_24h_vol', 0)
            
            return {
                "symbol": symbol.upper(),
                "price": current_price,
                "change_24h": change_24h,
                "change_percent": change_24h,  # CoinGecko returns percentage directly
                "volume_24h": volume_24h,
                "currency": "USD",
                "last_updated": datetime.now().isoformat(),
                "source": "coingecko"
            }
            
        except Exception as e:
            logger.error(f"CoinGecko API error for {symbol}: {str(e)}")
            return {"error": f"Could not fetch crypto price for {symbol}: {str(e)}"}
    
    async def get_price(self, symbol: str, asset_type: str = None) -> Dict:
        """Get price for any symbol (auto-detect or specify type)"""
        try:
            # If type is specified, use it
            if asset_type == 'crypto':
                return self.get_crypto_price(symbol)
            elif asset_type == 'stock':
                return await self.get_stock_price(symbol)
            
            # Auto-detect based on symbol
            if symbol.upper() in self.crypto_symbol_map:
                return self.get_crypto_price(symbol)
            else:
                return await self.get_stock_price(symbol)
                
        except Exception as e:
            logger.error(f"Error getting price for {symbol}: {str(e)}")
            return {"error": f"Could not fetch price for {symbol}"}
    
    async def get_multiple_prices(self, symbols: list, asset_types: dict = None) -> Dict:
        """Get prices for multiple symbols efficiently"""
        tasks = []
        for symbol in symbols:
            asset_type = asset_types.get(symbol) if asset_types else None
            tasks.append(self.get_price(symbol, asset_type))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        price_data = {}
        for i, result in enumerate(results):
            symbol = symbols[i]
            if isinstance(result, Exception):
                price_data[symbol] = {"error": str(result)}
            else:
                price_data[symbol] = result
        
        return price_data

# Global instance
price_service = PriceService()