import React, { useState } from 'react';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';

export function SignIn() {
  const { address, chainId, isConnected } = useAccount();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();

  async function handleSignIn() {
    if (!isConnected || !address || !chainId || !publicClient) {
      alert('請先連接您的錢包');
      return;
    }

    setIsSigningIn(true);
    const nonce = generateSiweNonce();

    try {
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: '1',
      });

      const signature = await signMessageAsync({ account: address, message });

      const valid = await publicClient.verifySiweMessage({ message, signature });
      if (!valid) throw new Error('SIWE verification failed');
      alert('驗證成功！');
    } catch (err) {
      console.error(err);
      alert('驗證失敗');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={!isConnected || isSigningIn}
      className={`px-4 py-2 rounded-lg font-bold text-sm bg-brand text-black shadow-lg shadow-brand/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isSigningIn ? '驗證中...' : '連接以太坊身分 (SIWE)'}
    </button>
  );
}
