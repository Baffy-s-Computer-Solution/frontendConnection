import axios from 'axios';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export const newsService = {
  // Get business news
  getBusinessNews: async (country = 'ls', category = 'business', pageSize = 10) => {
    if (!NEWS_API_KEY) return [];
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country,
          category,
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt,
        content: article.content,
      }));
    } catch (error) {
      console.error('Error fetching business news:', error);
      return [];
    }
  },

  // Get Lesotho-specific news
  getLesothoNews: async () => {
    if (!NEWS_API_KEY) return [];
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'Lesotho OR Maseru economy business jobs',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 15,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles
        .filter(
          (article) =>
            article.title &&
            article.description &&
            (article.title.toLowerCase().includes('lesotho') ||
              article.description.toLowerCase().includes('lesotho') ||
              article.content?.toLowerCase().includes('lesotho'))
        )
        .map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
          relevance: 'lesotho',
        }))
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching Lesotho news:', error);
      return [];
    }
  },

  // Get career and job market news
  getCareerNews: async () => {
    if (!NEWS_API_KEY) return [];
    try {
      const queries = [
        'recruitment hiring',
        'job market',
        'career development',
        'employment trends',
        'workplace skills',
      ];

      const newsPromises = queries.map((query) =>
        axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: query,
            language: 'en',
            sortBy: 'relevancy',
            pageSize: 3,
            apiKey: NEWS_API_KEY,
          },
        })
      );

      const responses = await Promise.all(newsPromises);
      let allArticles = [];

      responses.forEach((response) => {
        if (response.data.articles) {
          allArticles = [...allArticles, ...response.data.articles];
        }
      });

      // Remove duplicates and format
      const uniqueArticles = Array.from(
        new Map(allArticles.map((article) => [article.url, article])).values()
      ).map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: 'career',
      }));

      return uniqueArticles.slice(0, 12);
    } catch (error) {
      console.error('Error fetching career news:', error);
      return [];
    }
  },

  // Get news categories for dashboard
  getDashboardNews: async () => {
    try {
      return {
        business: await newsService.getBusinessNews('us', 'business', 5),
        career: await newsService.getCareerNews(),
        lesotho: await newsService.getLesothoNews(),
      };
    } catch (error) {
      console.error('Error fetching dashboard news:', error);
      return { business: [], career: [], lesotho: [] };
    }
  },

  // Search news
  searchNews: async (query, language = 'en', sortBy = 'relevancy', pageSize = 20) => {
    if (!NEWS_API_KEY) return [];
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language,
          sortBy,
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt,
      }));
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  },
};

// Weather service (if needed later)
export const weatherService = {
  getWeather: async () => {
    try {
      // This would use a weather API
      return {
        temperature: 22,
        condition: 'Sunny',
        humidity: 65,
        windSpeed: 12,
      };
      // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  },
};

// Currency exchange service (if needed later)
export const currencyService = {
  getExchangeRates: async () => {
    try {
      // This would use a currency API
      const rates = {
        USD: 1,
        ZAR: 18.5,
        LSL: 18.5,
        EUR: 0.92,
      };
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return {
        USD: 1,
        ZAR: 18.5,
        LSL: 18.5,
        EUR: 0.92,
      };
    }
  },
};

// API Toggle Configuration
const API_CONFIG = {
  enabled: {
    news: true,
    jobs: true,
    economy: true,
    currency: true,
    youtube: true,
  },

  // Toggle API on/off
  toggle: (apiName) => {
    if (Object.prototype.hasOwnProperty.call(API_CONFIG.enabled, apiName)) {
      API_CONFIG.enabled[apiName] = !API_CONFIG.enabled[apiName];
      return API_CONFIG.enabled[apiName];
    }
    return false;
  },

  // Get all enabled APIs
  getEnabled: () => {
    return Object.keys(API_CONFIG.enabled).filter((key) => API_CONFIG.enabled[key]);
  },
};

const EXTERNAL_APIS = {
  // News API for Lesotho and Africa business news
  news: {
    getBusinessNews: async () => {
      if (!API_CONFIG.enabled.news) return [];

      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=Lesotho+entrepreneurship+business+economy&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.VITE_NEWS_API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'ok') {
          return data.articles.slice(0, 5).map((article) => ({
            title: article.title,
            description: article.description || 'No description available',
            url: article.url,
            image: article.urlToImage,
            source: article.source.name,
            publishedAt: new Date(article.publishedAt),
          }));
        }

        return [];
      } catch (error) {
        console.warn('News API error:', error);
        return [];
      }
    },
  },

  // Jobs API for Lesotho opportunities
  jobs: {
    getLatestJobs: async () => {
      if (!API_CONFIG.enabled.jobs) return [];

      try {
        const response = await fetch(
          'https://api.example.com/jobs/lesotho?limit=5'
        );
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Jobs API error:', error);
        return [];
      }
    },
  },

  // Economic data for Lesotho
  economy: {
    getEconomicIndicators: async () => {
      if (!API_CONFIG.enabled.economy) return null;

      try {
        // World Bank API for Lesotho economic data
        const response = await fetch(
          'https://api.worldbank.org/v2/country/LS/indicator/NY.GDP.MKTP.CD?format=json&date=2023'
        );
        const data = await response.json();

        // Get latest GDP data
        const gdpData = data[1]?.find((item) => item.value);
        const gdp = gdpData?.value ? `$${(gdpData.value / 1000000000).toFixed(1)}B` : 'N/A';

        return {
          gdp,
          growthRate: '+2.3%', // From World Bank 2023 estimate
          unemployment: '24.6%', // Lesotho unemployment rate 2023
          inflation: '6.8%', // Lesotho inflation 2023
          youthUnemployment: '34.2%', // Youth unemployment in Lesotho
          source: 'World Bank 2023',
          updated: new Date(),
        };
      } catch (error) {
        console.warn('Economic data API error:', error);
        return {
          gdp: '$2.4B',
          growthRate: '+2.3%',
          unemployment: '24.6%',
          inflation: '6.8%',
          youthUnemployment: '34.2%',
          source: 'Sample Data',
          updated: new Date(),
        };
      }
    },

    // Get business trends in Lesotho
    getBusinessTrends: async () => {
      if (!API_CONFIG.enabled.economy) return [];

      return [
        { sector: 'Agriculture', growth: '+4.2%', trend: 'up' },
        { sector: 'Textiles', growth: '-1.5%', trend: 'down' },
        { sector: 'Tourism', growth: '+8.7%', trend: 'up' },
        { sector: 'ICT', growth: '+12.3%', trend: 'up' },
        { sector: 'Mining', growth: '+2.1%', trend: 'up' },
      ];
    },
  },

  // Currency exchange rates for Lesotho (LSL)
  currency: {
    getExchangeRates: async () => {
      if (!API_CONFIG.enabled.currency) return null;

      try {
        // Exchange rate API
        const response = await fetch(
          'https://api.exchangerate.host/latest?base=ZAR&symbols=USD,EUR,GBP,LSL'
        );
        const data = await response.json();

        return {
          ZAR_LSL: '1.00', // 1:1 pegged
          ZAR_USD: data.rates.USD ? data.rates.USD.toFixed(3) : '0.054',
          ZAR_EUR: data.rates.EUR ? data.rates.EUR.toFixed(3) : '0.050',
          ZAR_GBP: data.rates.GBP ? data.rates.GBP.toFixed(3) : '0.043',
          updated: new Date(data.date),
        };
      } catch (error) {
        console.warn('Exchange rate API error:', error);
        return {
          ZAR_LSL: '1.00',
          ZAR_USD: '0.054',
          ZAR_EUR: '0.050',
          ZAR_GBP: '0.043',
          updated: new Date(),
        };
      }
    },
  },

  // YouTube videos for entrepreneurship in Africa
  youtube: {
    getEntrepreneurshipVideos: async () => {
      if (!API_CONFIG.enabled.youtube) return [];

      try {
        // YouTube API call (requires API key)
        /*
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=entrepreneurship+Lesotho+African+business+startup&maxResults=3&type=video&key=${process.env.VITE_YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        */

        return [];
      } catch (error) {
        console.warn('YouTube API error:', error);
        return [];
      }
    },
  },

  // Lesotho Government initiatives
  government: {
    getInitiatives: async () => {
      return [
        {
          title: 'Youth Entrepreneurship Fund',
          description: 'Government funding for youth-led businesses',
          amount: 'M 50M',
          deadline: '2024-06-30',
          link: '#',
        },
        {
          title: 'Lesotho National Development Corporation',
          description: 'Support for industrial development',
          amount: 'Various',
          deadline: 'Ongoing',
          link: '#',
        },
      ];
    },
  },

  // API Configuration
  config: API_CONFIG,
};

export default EXTERNAL_APIS;
