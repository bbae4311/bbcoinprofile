import React, { useEffect, useState } from 'react';
import './CryptoPnLCards.css';

const CryptoPnLCards = () => {
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('AUD'); // 'AUD' or 'USD'

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
                            AUD: ${currentValueAUD.toFixed(2)} (
                            {buyCostAUD.toFixed(2)})({valueDiffAUD.toFixed(2)})
                        </p>
                    )}
                    {kidsPL > 0 && <p>Kids Profit/Loss: {kidsPL.toFixed(2)}</p>}
                    {currency !== 'AUD' && (
                        <p>
                            USD: ${currentValueUSD.toFixed(2)} (
                            {buyCostUSD.toFixed(2)})({valueDiffUSD.toFixed(2)})
                        </p>
                    )}
                </p>
                <p className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Price (Buy Price)(Diff)</strong>
                    </p>
                    {currency === 'AUD' && (
                        <p>
                            AUD: ${current?.aud.toFixed(3)} (
                            {buyPriceAUD.toFixed(3)})({priceDiffAUD.toFixed(3)})
                        </p>
                    )}
                    {currency !== 'AUD' && (
                        <p>
                            USD: ${current?.usd.toFixed(3)} (
                            {buyPriceUSD.toFixed(3)})({priceDiffUSD.toFixed(3)})
                        </p>
                    )}
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
