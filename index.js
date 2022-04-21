/* pages/index.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import { useWeb3 } from '@3rdweb/hooks'
import { useWeb3React } from "@web3-react/core"
import { injected } from "../connectors.js"

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import App from 'next/app'
import { id } from 'ethers/lib/utils'


export default function Home() {
  const { active, account, library, connector, activate, deactivate } = useWeb3React()
  
  function buttonchange(){
    var connectbtn = document.getElementById("connectbutton");
    connectbtn.innerText =         
    account[0] +
    account[1] +
    account[2] +
    account[3] +
    account[4] +
    account[5] +
    "..." +
    account[38] +
    account[39] +
    account[40] +
    account[41];
    }

  async function connect() {
    try {
      await activate(injected)
      localStorage.setItem('isWalletConnected', true)
    } catch (ex) {
      console.log(ex)
    }
     buttonchange();
  }
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem('isWalletConnected') === 'true') {
        try {
          await activate(injected)
          localStorage.setItem('isWalletConnected', true)
        } catch (ex) {
          console.log(ex)
        }
      }
    }
    connectWalletOnPageLoad()
  }, [])
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider("https://www.ethercluster.com/etc")
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()


    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */


    function groupBy(list, keyGetter) {
      const map = new Map();
      list.forEach((item) => {
           const key = keyGetter(item);
           const collection = map.get(key);
           if (!collection) {
               map.set(key, [item]);
           } else {
               collection.push(item);
           }
      });
      return map;
  }
      

      const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }

  function redirect(nft){
    var identity = nft.tokenId;
    var redir = `https://blockscout.com/etc/mainnet/token/0x46ce4c64a5c5c16b6e2d276878d93d744f6c974f/instance/${nft.tokenId}/metadata`
    document.getElementById(nft.tokenId).href = redir;
  }
  function redirectcreator(nft){
    var creatoraddress = nft.tokenId;
    var redir = `https://blockscout.com/etc/mainnet/address/${nft.seller}/token-transfers`
    document.getElementById(nft.seller).href = redir;
  }
  function button(){
    document.getElementById('connectbutton').innerText = 'Connected';
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-0 py-10 text-2xl">No items in marketplace</h1>)

  return (
    <body>
    <main>
    <div>
        <button id="connectbutton" href = "" onClick={() => connect()} className="py-1 px-1 mt-1 mb-1 text-xs font-bold text-white rounded-sm w-85 bg-slate-600 hover:bg-emerald-800">
        Connect to MetaMask</button> <br></br>{active ? <a></a> : <span>Not connected</span>}
  
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1200px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
          {
          //order by timestamp before mapping
            
            nfts.map((nft, i) => ( 
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img style = {{height: '230px',width:'350px'}}  src={nft.image} />
                <div className="p-1 justify-center">
                  <a style={{ height: '25px' }} class="hover:bg-slate-100 text-sm font-semibold text-emerald" id = {nft.tokenId} href = "" onClick={() => redirect(nft)}>{nft.name}</a>
                  <div className = "truncate justify-center"style={{ height: '70px',minHeight: '50px', overflow: 'ellipsis' }}>
                    <p className="text-xs mb-1 text-black justify-center font-bold">{nft.price}ETC</p>
                    <p className="text-xs mb-1 text-black justify-center">Creator:</p>
                    <a id = {nft.seller} className="rounded-sm text-xs mb-2 text-black-400"href="" target = "_blank" onClick = {()=>redirectcreator(nft)}>{nft.seller}</a>
                  </div>
                </div>
                <div className="p-1 bg-teal justify-center">
                  <button className="w-full bg-green-800 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
        <div> 
        </div>
      </div>
    </div>
    </div>
    </main>  
    </body>
  )
}
  