const Moralis=require('moralis').default;
const bodyParser = require('body-parser');
const express=require('express');
const cors=require('cors');
const app= express();
const PORT=3500;

//Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

Moralis.start({
  apiKey: "XwD26DKZb5exdWakOXx0pSR2gRHtn9BrRe2SMndYKpkcpmkPrPOWBRrclLMo99ky"
});

app.get("/",async(req,res)=>{
  res.send("Welcome to Moralis World!");
})



app.get("/transactions",async(req,res)=>{
//async function NFTUP(){
  try {
    
    const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
      "address": "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326"
    });

    let data=response.result.activeChains;
  
   // console.log(response.result.activeChains.map((k,v)=>console.log(k,v)));
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

    //0xDC24316b9AE028F1497c275EB9192a3Ea0f67022
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





app.listen(PORT,()=>{
  console.log(`App is running on PORT ${PORT}`);
})