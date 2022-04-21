import '../styles/globals.css'
import Link from 'next/link'
import WalletCard from '../WalletCard';
import {Thirdweb3Provider} from '@3rdweb/hooks';
import { useWeb3React } from "@web3-react/core"
import { injected } from "../connectors.js"
import { useEffect, useState } from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'




const supportedChainIds = [1,61]
const connectors = {
    injected: {}
}
function getLibrary(provider) {
  return new Web3(provider)
}

function MyApp({ Component, pageProps}) {
  const { active, account, library, connector, activate, deactivate } = useWeb3React()
  
  async function connect() {
    try {
      await activate(injected)
      localStorage.setItem('isWalletConnected', true)
    } catch (ex) {
      console.log(ex)
    }
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
  
  
  return (
   <div>
    <div> 
  
      <div>
      </div>
   
    <div className = "text-center">
    <header>
      <nav className="font-serif: Georgia flex justify-center space-x-6 text-center">  
      <a href = '/' className="font-serif: Georgia, text-4xl justify-center font-bold hover:bg-slate-100 hover:text-black-900 text-Black-700">
        MILE XII</a>
      </nav>
      <nav className="font-serif: Georgia flex justify-center space-x-6 text-center">
      </nav>
      <nav className="flex justify-center space-x-6">
        {[
            ['List NFT', '/create-item'],
            ['My NFTs', '/my-assets'],
            ['Dashboard', '/creator-dashboard'],
        ].map(([title, url]) => (
            <a href={url} className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">{title}</a>
        ))}
     </nav>
     </header>
    <div className="font-bold absolute top-0 left-1 rounded-lg px-3 py-2 text-black-700 text-md hover:bg-slate-100 hover:text-black-900" >
      <a href= "https://mirror.xyz/0x4B0728B9B1E45583bFb8bD738C9C6c8906f2841d/eWx3szrnmmBupH_tUxShC23fAhGCuybbuXd89l3QCk8" target="_blank">
      Guide</a>
    </div>
    
        <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
        </Web3ReactProvider>
    </div>

    </div>
    <div>
    <footer className=" justify-center">
      <p><a className="font-bold text-xs" href="https://blockscout.com/etc/mainnet/token/0x46CE4C64a5c5c16B6E2d276878D93d744F6c974f/token-transfers">Token Address</a></p>
      <p><a className="font-bold text-xs" href="https://blockscout.com/etc/mainnet/address/0xE20FD375e1E2c893c518DBEc1Bd8A1D5C8F100F7/transactions">Market Address</a></p>
    </footer>
    </div>
    </div>    
    

  )
}

export default MyApp
