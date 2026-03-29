import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';

import './CryptoPnLCards.css';

const CryptoPnLCards = () => {
    const [prices, setPrices] = useState({});
    const [pricesUSDStock, setPricesUSDStock] = useState({});
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('AUD'); // 'AUD' or 'USD'
    const [totalValueAUD, setTotalValueAUD] = useState(0);
    const [totalBuyCostAUD, setTotalBuyCostAUD] = useState(0);
    const [totalValueDiffAUD, setTotalValueDiffAUD] = useState(0);

    const [totalValueAUDUSDStock, setTotalValueAUDUSDStock] = useState(0);
    const [totalBuyCostAUDUSDStock, setTotalBuyCostAUDUSDStock] = useState(0);
    const [totalValueDiffAUDUSDStock, setTotalValueDiffAUDUSDStock] =
        useState(0);

    const portfolio = {
        BTC: { buyCostAUD: 15460, units: 0.09017469 },
        XRP: { buyCostAUD: 22652.21, units: 5353.007347 },
        XLM: { buyCostAUD: 1000, units: 1508.5 },
        XDC: { buyCostAUD: 1000, units: 7468.84244715 },
        HBAR: { buyCostAUD: 5000, units: 11857.15 },
        SOL: { buyCostAUD: 356.1552, units: 1.02434524 },
        DOGE: { buyCostAUD: 200, units: 619.38 },
        SHIB: { buyCostAUD: 94.34, units: 4839385.6 },
        PENGU: { buyCostAUD: 100, units: 2591.2 },
    };

    const portfolioUSDStock = {
        TSLA: { buyCostUSD: 5074.11912, units: 28 },
        VYM: { buyCostUSD: 6493.11912, units: 48 },
        WMT: { buyCostUSD: 616.01, units: 6 },
        KO: { buyCostUSD: 103.35272, units: 2 },
    };

    function dollarFormat(num) {
        if (num < 0.01) return num.toFixed(6);
        else
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
    }

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,XRP,XLM,XDC,HBAR,SOL,DOGE,SHIB,PENGU&tsyms=USD,AUD&api_key=YOUR_API_KEY'
            );
            const data = await res.json();
            setPrices({
                BTC: { usd: data.BTC.USD, aud: data.BTC.AUD },
                XRP: { usd: data.XRP.USD, aud: data.XRP.AUD },
                XLM: { usd: data.XLM.USD, aud: data.XLM.AUD },
                XDC: { usd: data.XDC.USD, aud: data.XDC.AUD },
                HBAR: { usd: data.HBAR.USD, aud: data.HBAR.AUD },
                SOL: { usd: data.SOL.USD, aud: data.SOL.AUD },
                DOGE: { usd: data.DOGE.USD, aud: data.DOGE.AUD },
                SHIB: { usd: data.SHIB.USD, aud: data.SHIB.AUD },
                PENGU: { usd: data.PENGU.USD, aud: data.PENGU.AUD },
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
                portfolio.XDC.units * data.XDC.AUD +
                portfolio.SOL.units * data.SOL.AUD +
                portfolio.DOGE.units * data.DOGE.AUD +
                portfolio.SHIB.units * data.SHIB.AUD +
                portfolio.PENGU.units * data.PENGU.AUD;
            setTotalBuyCostAUD(buyCostAUD);
            setTotalValueAUD(buyValueAUD);
            setTotalValueDiffAUD(buyValueAUD - buyCostAUD);

            const usdInAud = data.BTC.AUD / data.BTC.USD;
            let stockPrices = {
                TSLA: { usd: 0, usdInAud: usdInAud },
                VYM: { usd: 0, usdInAud: usdInAud },
                WMT: { usd: 0, usdInAud: usdInAud },
                KO: { usd: 0, usdInAud: usdInAud },
            };
            stockPrices.TSLA.usd = await fetchStock('TSLA');
            stockPrices.VYM.usd = await fetchStock('VYM');
            stockPrices.WMT.usd = await fetchStock('WMT');
            stockPrices.KO.usd = await fetchStock('KO');

            setPricesUSDStock(stockPrices);

            const buyCostAUDUSDStock = Object.values(portfolioUSDStock).reduce(
                (total, asset) => total + asset.buyCostUSD * usdInAud,
                0
            );
            const buyValueAUDUSDStock =
                portfolioUSDStock.TSLA.units * stockPrices.TSLA.usd * usdInAud +
                portfolioUSDStock.VYM.units * stockPrices.VYM.usd * usdInAud +
                portfolioUSDStock.WMT.units * stockPrices.WMT.usd * usdInAud +
                portfolioUSDStock.KO.units * stockPrices.KO.usd * usdInAud;

            setTotalBuyCostAUDUSDStock(buyCostAUDUSDStock);
            setTotalValueAUDUSDStock(buyValueAUDUSDStock);
            setTotalValueDiffAUDUSDStock(
                buyValueAUDUSDStock - buyCostAUDUSDStock
            );
        } catch (err) {
            console.error('Failed to fetch prices:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStock = async (symbol) => {
        const res = await fetch(
            `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=oEYMZph8K9oYYxYtWDhyVV6TVabSCf1v`
        );
        const data = await res.json();

        return data[0]['price'];
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
            else if (symbol === 'SOL') code = 'solana';
            else if (symbol === 'DOGE') code = 'dogecoin';
            else if (symbol === 'SHIB') code = 'shiba-inu';
            else if (symbol === 'PENGU') code = 'pudgy-penguins';

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
                <div className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Value (Buy Cost)(Profit/Loss)</strong>
                    </p>
                    {currency === 'AUD' && (
                        <p>
                            AUD: ${dollarFormat(currentValueAUD)} (
                            {dollarFormat(buyCostAUD)})(
                            {dollarFormat(valueDiffAUD)})(
                            {((valueDiffAUD / buyCostAUD) * 100).toFixed(2)}%)
                        </p>
                    )}
                    {currency === 'AUD' && kidsPL > 0 && (
                        <p>Kids Profit/Loss: {kidsPL.toFixed(6)}</p>
                    )}
                    {currency !== 'AUD' && (
                        <p>
                            USD: ${dollarFormat(currentValueUSD)} (
                            {dollarFormat(buyCostUSD)})(
                            {dollarFormat(valueDiffUSD)})(
                            {((valueDiffUSD / buyCostUSD) * 100).toFixed(2)}%)
                        </p>
                    )}
                </div>
                <div className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Price (Buy Price)(Diff)</strong>
                    </p>
                    {currency === 'AUD' && (
                        <p>
                            AUD: ${dollarFormat(current?.aud)} (
                            {dollarFormat(buyPriceAUD)})(
                            {dollarFormat(priceDiffAUD)})
                        </p>
                    )}
                    {currency !== 'AUD' && (
                        <p>
                            USD: ${dollarFormat(current?.usd)} (
                            {dollarFormat(buyPriceUSD)})(
                            {dollarFormat(priceDiffUSD)})
                        </p>
                    )}
                </div>
                <p>
                    <button onClick={() => handleClick(symbol)}>Chart</button>
                </p>
            </div>
        );
    };

    const renderCardUSDStock = (symbol) => {
        const current = pricesUSDStock[symbol];
        const { buyCostUSD, units } = portfolioUSDStock[symbol];
        const currentValueUSD = units * current?.usd;
        const valueDiffUSD = currentValueUSD - buyCostUSD;
        const valueDiffAUD = valueDiffUSD * current?.usdInAud;
        const buyPriceUSD = buyCostUSD / units;
        const priceDiffUSD = current?.usd - buyPriceUSD;
        const isProfit = priceDiffUSD > 0;

        return (
            <div className='card' key={symbol}>
                <h3>
                    {symbol} (Units:{units.toString()})
                </h3>
                <div className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Value (Buy Cost)(Profit/Loss)</strong>
                    </p>
                    <p>
                        USD: ${dollarFormat(currentValueUSD)} (
                        {dollarFormat(buyCostUSD)})(
                        {dollarFormat(valueDiffUSD)})(
                        {((valueDiffUSD / buyCostUSD) * 100).toFixed(2)}%)(AUD:
                        {dollarFormat(valueDiffAUD)})
                    </p>
                </div>
                <div className={isProfit ? 'profit' : 'loss'}>
                    <p>
                        <strong>Current Price (Buy Price)(Diff)</strong>
                    </p>
                    <p>
                        USD: ${dollarFormat(current?.usd)} (
                        {dollarFormat(buyPriceUSD)})(
                        {dollarFormat(priceDiffUSD)})
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className='container'>
            <div>
                <h3>Total Investment: CurrentValue(BuyCost)(Profit/Loss)</h3>
                <div
                    className={
                        totalValueAUD + totalValueAUDUSDStock >
                        totalBuyCostAUD + totalBuyCostAUDUSDStock
                            ? 'profit'
                            : 'loss'
                    }
                >
                    AUD: ${dollarFormat(totalValueAUD + totalValueAUDUSDStock)}{' '}
                    ({dollarFormat(totalBuyCostAUD + totalBuyCostAUDUSDStock)})(
                    {dollarFormat(
                        totalValueDiffAUD + totalValueDiffAUDUSDStock
                    )}
                    )(
                    {(
                        ((totalValueDiffAUD + totalValueDiffAUDUSDStock) /
                            (totalBuyCostAUD + totalBuyCostAUDUSDStock)) *
                        100
                    ).toFixed(2)}
                    %)
                </div>
            </div>
            <button onClick={fetchPrices}>🔄 Refresh</button>
            <br />
            <br />
            <Tabs>
                <TabList>
                    <Tab>Coin</Tab>
                    <Tab>US Stock</Tab>
                    <Tab>AU Stock</Tab>
                </TabList>

                <TabPanel>
                    <h2>💰 Crypto Portfolio ({currency})</h2>
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
                            <div
                                className={
                                    totalValueAUD > totalBuyCostAUD
                                        ? 'profit'
                                        : 'loss'
                                }
                            >
                                ${dollarFormat(totalValueAUD)} (
                                {dollarFormat(totalBuyCostAUD)})(
                                {dollarFormat(totalValueDiffAUD)})(
                                {(
                                    (totalValueDiffAUD / totalBuyCostAUD) *
                                    100
                                ).toFixed(2)}
                                %)
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <p>Loading prices...</p>
                    ) : (
                        <div className='card-list'>
                            {Object.keys(portfolio).map(renderCard)}
                        </div>
                    )}
                </TabPanel>
                <TabPanel>
                    <h2>💰 US Stock Portfolio</h2>
                    <div>
                        <h3>Total: CurrentValue(BuyCost)(Profit/Loss)</h3>
                        <div
                            className={
                                totalValueAUDUSDStock > totalBuyCostAUDUSDStock
                                    ? 'profit'
                                    : 'loss'
                            }
                        >
                            AUD: ${dollarFormat(totalValueAUDUSDStock)} (
                            {dollarFormat(totalBuyCostAUDUSDStock)})(
                            {dollarFormat(totalValueDiffAUDUSDStock)})(
                            {(
                                (totalValueDiffAUDUSDStock /
                                    totalBuyCostAUDUSDStock) *
                                100
                            ).toFixed(2)}
                            %)
                        </div>
                    </div>
                    {loading ? (
                        <p>Loading prices...</p>
                    ) : (
                        <div className='card-list'>
                            {Object.keys(portfolioUSDStock).map(
                                renderCardUSDStock
                            )}
                        </div>
                    )}
                </TabPanel>
                <TabPanel>
                    <h2>💰 AU Stock Portfolio</h2>
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default CryptoPnLCards;
