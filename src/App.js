import React, { useEffect, useState } from 'react';
import './CryptoPnLCards.css';

const CryptoPnLCards = () => {
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('AUD'); // 'AUD' or 'USD'
    const [totalValueAUD, setTotalValueAUD] = useState(0);
    const [totalBuyCostAUD, setTotalBuyCostAUD] = useState(0);
    const [totalValueDiffAUD, setTotalValueDiffAUD] = useState(0);

    const portfolio = {
        BTC: { buyCostAUD: 15460, units: 0.09017469 },
        XRP: { buyCostAUD: 15460, units: 3148.962 },
        XLM: { buyCostAUD: 1000, units: 1508.5 },
        XDC: { buyCostAUD: 1000, units: 7468.84244715 },
        HBAR: { buyCostAUD: 5000, units: 11857.15 },
    };

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,XRP,XLM,XDC,HBAR&tsyms=USD,AUD&api_key=YOUR_API_KEY'
            );
            const data = await res.json();
            setPrices({
                BTC: { usd: data.BTC.USD, aud: data.BTC.AUD },
                XRP: { usd: data.XRP.USD, aud: data.XRP.AUD },
                XLM: { usd: data.XLM.USD, aud: data.XLM.AUD },
                XDC: { usd: data.XDC.USD, aud: data.XDC.AUD },
                HBAR: { usd: data.HBAR.USD, aud: data.HBAR.AUD },
            });

            const buyCostAUD = Object.values(portfolio).reduce(
                (total, asset) => total + asset.buyCostAUD,
                0
            );
            const buyValueAUD =
                portfolio.BTC.units * data.BTC.AUD +
                portfolio.HBAR.units * data.HBAR.AUD +
                portfolio.XRP.units * data.XRP.AUD +
                portfolio.XLM.units * data.XLM.AUD +
                portfolio.XDC.units * data.XDC.AUD;
            setTotalBuyCostAUD(buyCostAUD);
            setTotalValueAUD(buyValueAUD);
            setTotalValueDiffAUD(buyValueAUD - buyCostAUD);
        } catch (err) {
            console.error('Failed to fetch prices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const renderCard = (symbol) => {
        const current = prices[symbol];
        const { buyCostAUD, units } = portfolio[symbol];
        const buyCostUSD = (current?.usd / current?.aud) * buyCostAUD;
        const currentValueAUD = units * current?.aud;
        const currentValueUSD = units * current?.usd;
        const valueDiffAUD = currentValueAUD - buyCostAUD;
        const valueDiffUSD = currentValueUSD - buyCostUSD;
        const buyPriceAUD = buyCostAUD / units;
        const buyPriceUSD = buyCostUSD / units;
        const priceDiffAUD = current?.aud - buyPriceAUD;
        const priceDiffUSD = current?.usd - buyPriceUSD;
        const isProfit = valueDiffAUD > 0;
        const kidsPL = symbol === 'BTC' ? (valueDiffAUD * 500) / buyCostAUD : 0;

        const handleClick = (symbol) => {
            let code = 'bitcoin';
            if (symbol === 'XRP') code = 'xrp';
            else if (symbol === 'HBAR') code = 'hedera';
            else if (symbol === 'XLM') code = 'stellar';
            else if (symbol === 'XDC') code = 'xdc-network';

            window.open(
                'https://www.coingecko.com/en/coins/' + code + '/' + currency,
                '_blank'
            );
        };

        return (
            <div className='card' key={symbol}>
                <h3>
                    {symbol} (Units:{units.toString()})
                </h3>
                <p className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Value (Buy Cost)(Profit/Loss)</strong>
                    </p>
                    {currency === 'AUD' && (
                        <p>
                            AUD: ${currentValueAUD.toLocaleString()} (
                            {buyCostAUD.toLocaleString()})(
                            {valueDiffAUD.toLocaleString()})
                        </p>
                    )}
                    {currency === 'AUD' && kidsPL > 0 && (
                        <p>Kids Profit/Loss: {kidsPL.toLocaleString()}</p>
                    )}
                    {currency !== 'AUD' && (
                        <p>
                            USD: ${currentValueUSD.toLocaleString()} (
                            {buyCostUSD.toLocaleString()})(
                            {valueDiffUSD.toLocaleString()})
                        </p>
                    )}
                </p>
                <p className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Price (Buy Price)(Diff)</strong>
                    </p>
                    {currency === 'AUD' && (
                        <p>
                            AUD: ${current?.aud.toLocaleString()} (
                            {buyPriceAUD.toLocaleString()})(
                            {priceDiffAUD.toLocaleString()})
                        </p>
                    )}
                    {currency !== 'AUD' && (
                        <p>
                            USD: ${current?.usd.toLocaleString()} (
                            {buyPriceUSD.toLocaleString()})(
                            {priceDiffUSD.toLocaleString()})
                        </p>
                    )}
                </p>
                <p>
                    <button onClick={() => handleClick(symbol)}>Chart</button>
                </p>
            </div>
        );
    };

    return (
        <div className='container'>
            <h2>💰 Crypto Portfolio ({currency})</h2>
            <button onClick={fetchPrices}>🔄 Refresh</button>
            <div className='toggle-group'>
                <button
                    className={currency === 'AUD' ? 'active' : ''}
                    onClick={() => setCurrency('AUD')}
                >
                    AUD
                </button>
                <button
                    className={currency === 'USD' ? 'active' : ''}
                    onClick={() => setCurrency('USD')}
                >
                    USD
                </button>
            </div>

            {currency === 'AUD' && (
                <div>
                    <h3>Total: CurrentValue(BuyCost)(Profit/Loss)</h3>
                    <p
                        className={
                            totalValueAUD > totalBuyCostAUD ? 'profit' : 'loss'
                        }
                    >
                        ${totalValueAUD.toLocaleString()} (
                        {totalBuyCostAUD.toLocaleString()})(
                        {totalValueDiffAUD.toLocaleString()})
                    </p>
                </div>
            )}

            {loading ? (
                <p>Loading prices...</p>
            ) : (
                <div className='card-list'>
                    {Object.keys(portfolio).map(renderCard)}
                </div>
            )}
        </div>
    );
};

export default CryptoPnLCards;
