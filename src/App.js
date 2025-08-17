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
        HBAR: { buyCostAUD: 5000, units: 11857.15 },
        XRP: { buyCostAUD: 15460, units: 3148.962 },
        XLM: { buyCostAUD: 1000, units: 1508.5 },
    };

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ripple,hedera-hashgraph,stellar&vs_currencies=usd,aud'
            );
            const data = await res.json();
            setPrices({
                BTC: { usd: data.bitcoin.usd, aud: data.bitcoin.aud },
                XRP: { usd: data.ripple.usd, aud: data.ripple.aud },
                HBAR: {
                    usd: data['hedera-hashgraph'].usd,
                    aud: data['hedera-hashgraph'].aud,
                },
                XLM: { usd: data.stellar.usd, aud: data.stellar.aud },
            });

            const buyCostAUD = Object.values(portfolio).reduce(
                (total, asset) => total + asset.buyCostAUD,
                0
            );
            const buyValueAUD =
                portfolio.BTC.units * data.bitcoin.aud +
                portfolio.HBAR.units * data['hedera-hashgraph'].aud +
                portfolio.XRP.units * data.ripple.aud +
                portfolio.XLM.units * data.stellar.aud;
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
