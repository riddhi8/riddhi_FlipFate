// Robust Freighter Wallet and Stellar Testnet Integration
import * as freighter from '@stellar/freighter-api';

export interface RealWalletInfo {
  installed: boolean;
  address: string | null;
  network: string | null;
  error?: string;
}

/**
 * Check if Freighter extension is installed in the user's browser
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Check global window.freighter first
    if ((window as unknown as { freighter?: unknown }).freighter) {
      return true;
    }

    const res = await freighter.isConnected();
    if (typeof res === 'boolean') {
      return res;
    }
    if (res && typeof res === 'object' && 'isConnected' in res) {
      return !!(res as { isConnected: boolean }).isConnected;
    }
    return !!res;
  } catch (err) {
    console.warn('Freighter installation check notice:', err);
    return false;
  }
}

/**
 * Request connection and public key from Freighter
 */
export async function connectFreighterWallet(): Promise<RealWalletInfo> {
  if (typeof window === 'undefined') {
    return {
      installed: false,
      address: null,
      network: null,
      error: 'Browser window is not available',
    };
  }

  try {
    const isInstalled = await checkFreighterInstalled();

    if (!isInstalled) {
      return {
        installed: false,
        address: null,
        network: null,
        error: 'Freighter extension was not detected in your browser. Please install Freighter from https://www.freighter.app/ or use the Instant Testnet Simulator.',
      };
    }

    // Request access from Freighter popup
    let accessResult = null;
    try {
      accessResult = await freighter.requestAccess();
    } catch (err) {
      console.warn('requestAccess failed, trying setAllowed:', err);
      try {
        await freighter.setAllowed();
      } catch {
        // ignore
      }
    }

    // Retrieve address
    let address: string | null = null;
    if (accessResult && typeof accessResult === 'object' && 'address' in accessResult && accessResult.address) {
      address = accessResult.address;
    } else {
      try {
        const addrObj = await freighter.getAddress();
        if (typeof addrObj === 'string') {
          address = addrObj;
        } else if (addrObj && typeof addrObj === 'object' && 'address' in addrObj) {
          address = (addrObj as { address: string }).address || null;
        }
      } catch (err) {
        console.warn('getAddress notice:', err);
      }
    }

    if (!address) {
      return {
        installed: true,
        address: null,
        network: 'TESTNET',
        error: 'Wallet access was rejected or closed by the user.',
      };
    }

    // Retrieve active network
    let network = 'TESTNET';
    try {
      const netDetails = await freighter.getNetworkDetails();
      if (netDetails && typeof netDetails === 'object' && 'network' in netDetails) {
        network = (netDetails as { network: string }).network || 'TESTNET';
      }
    } catch {
      try {
        const netStr = await freighter.getNetwork();
        if (typeof netStr === 'string') network = netStr;
      } catch {
        // ignore
      }
    }

    return {
      installed: true,
      address,
      network,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      installed: false,
      address: null,
      network: null,
      error: msg,
    };
  }
}

/**
 * Fetch real native balance from Stellar Horizon API for any public key
 */
export async function fetchHorizonBalance(address: string, network: string = 'TESTNET'): Promise<number> {
  if (!address) return 1000;

  try {
    const isMainnet = network.toUpperCase().includes('PUBLIC') || network.toUpperCase().includes('MAIN');
    const horizonUrl = isMainnet ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';

    const res = await fetch(`${horizonUrl}/accounts/${address}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return 1000; // Default starter test balance if unactivated
    }

    const data = await res.json();
    const nativeBal = data.balances?.find((b: { asset_type: string; balance: string }) => b.asset_type === 'native');
    if (nativeBal && nativeBal.balance) {
      return Math.floor(parseFloat(nativeBal.balance));
    }
    return 1000;
  } catch (err) {
    console.warn('Horizon fetch fallback:', err);
    return 1000;
  }
}

/**
 * Fund any Stellar Testnet address with 10,000 test XLM via Stellar Friendbot
 */
export async function fundWithFriendbot(address: string): Promise<boolean> {
  if (!address) return false;
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    return res.ok;
  } catch (err) {
    console.warn('Friendbot API call notice:', err);
    return false;
  }
}
