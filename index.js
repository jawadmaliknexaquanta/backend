const Moralis=require('moralis').default;
const bodyParser = require('body-parser');
const express=require('express');
const cors=require('cors');
const app= express();
const PORT=3500;
require('dotenv').config(); 

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


const config = {
  domain: process.env.APP_DOMAIN,
  statement: 'Please sign this message to confirm your identity.',
  uri: process.env.REACT_URL,
  timeout: 60,
};

//Middleware
app.use(express.json());
app.use(bodyParser.json());
// allow access to React app domain
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
Moralis.start({
  apiKey:process.env.MORALIS_API_KEY
});

app.get("/",async(req,res)=>{
  res.send("Welcome to Moralis World!");
})


app.post('/request-message', async (req, res) => {
  const { address, chain, network } = req.body;

  try {
    const message = await Moralis.Auth.requestMessage({
      address,
      chain,
      ...config,
    });

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.post('/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;

    const { address, profileId } = (
      await Moralis.Auth.verify({
        message,
        signature,
        networkType: 'evm',
      })
    ).raw;

    const user = { address, profileId, signature };

    // create JWT token
    const token = jwt.sign(user, process.env.AUTH_SECRET);

    // set JWT cookie
    res.cookie('jwt', token, {
      httpOnly: true,
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.get('/authenticate', async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(403); // if the user did not send a jwt token, they are unauthorized

  try {
    const data = jwt.verify(token, process.env.AUTH_SECRET);
    res.json(data);
  } catch {
    return res.sendStatus(403);
  }
});

app.get('/logout', async (req, res) => {
  try {
    res.clearCookie('jwt');
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(403);
  }
});


app.get("/transactions",async(req,res)=>{
//async function NFTUP(){
  try {
    
    const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
      "address": "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326"
    });

    let data=response.result.activeChains;
  
   if(!data){
    console.log("Not found the Expected Data")
     return res.status(404).send("Expected data not found");
   }
   
    let dataRes=data.map((items,value)=>{
      return items
    })

    return res.status(200).send(dataRes);

  } catch (e) {
    console.error(e);
  }
  
});


app.get("/wal-bal",async(req,res)=>{
  try {

    let {address}=req.query;
    console.log(typeof(address));
   
    const response = await Moralis.EvmApi.balance.getNativeBalance({
      "chain": "0x1",
      "address": address
    });
  
    return res.status(200).send(response.result);

    console.log(response.raw);
  } catch (e) {
    console.error(e);
  }
})

app.get("/top-collections",async(req,res)=>{
  try {
  
  
    const response = await Moralis.EvmApi.marketData.getTopNFTCollectionsByMarketCap({});
  
    console.log(response.raw);
    res.status(200).send(response.result);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
})

app.get("/top-cryptos",async(req,res)=>{
  try{

  const response = await Moralis.EvmApi.marketData.getTopCryptoCurrenciesByTradingVolume({});

  console.log(response.raw);
  res.status(200).send(response.result);

} catch (e) {
  console.error(e);
}
})
app.get("/top-cryptos/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const response = await Moralis.EvmApi.marketData.getTopCryptoCurrenciesByTradingVolume({});

    const crypto = response.result.find(c =>
      c.symbol.toLowerCase() === symbol.toLowerCase() 
    );

    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    res.status(200).json(crypto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/top-collections/:rank", async (req, res) => {
  try {
    const { rank } = req.params;

    const response = await Moralis.EvmApi.marketData.getTopNFTCollectionsByMarketCap({});

    const crypto = response.result.find(c => c.rank === parseInt(rank));


    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    res.status(200).json(crypto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get("/top-erc",async(req,res)=>{
  try{

  const response = await Moralis.EvmApi.token.getTokenMetadata({"chain": "0x1"});

  console.log("GGFD",response)
 let filterDat=response?.result[0];
  res.status(200).send(filterDat);

} catch (e) {
  console.error(e);
}
})


app.listen(PORT,()=>{
  console.log(`App is running on PORT ${PORT}`);
})