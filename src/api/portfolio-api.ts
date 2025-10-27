import { getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  PortfolioResponse,
  InvestmentSummaryResponse,
} from "../api/models/portfolio.model";

export const portfolioApi = {
  getPortfolio: (token: string) =>
    getAxiosClient.get<PortfolioResponse>(ENDPOINTS.USER.PORTFOLIO, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getInvestmentSummary: (token: string) =>
    getAxiosClient.get<InvestmentSummaryResponse>(
      ENDPOINTS.USER.INVESTMENT_SUMMARY,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
};