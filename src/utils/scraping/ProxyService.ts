
export class ProxyService {
  private static corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  static async fetchWithProxy(url: string, proxy: string, proxyIndex: number): Promise<string | null> {
    let proxyUrl: string;
    let response: Response;

    switch (proxyIndex) {
      case 0: // allorigins
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.contents || null;

      case 1: // cors-anywhere
        proxyUrl = `${proxy}${url}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();

      case 2: // corsproxy.io
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();

      case 3: // codetabs
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();

      default:
        throw new Error('Unknown proxy');
    }
  }

  static async tryAllProxies(url: string): Promise<string | null> {
    for (let i = 0; i < this.corsProxies.length; i++) {
      const proxy = this.corsProxies[i];
      console.log(`Attempting with proxy ${i + 1}:`, proxy);
      
      try {
        const html = await this.fetchWithProxy(url, proxy, i);
        if (html) {
          return html;
        }
      } catch (proxyError) {
        console.log(`Proxy ${i + 1} failed:`, proxyError);
      }
    }
    return null;
  }
}
