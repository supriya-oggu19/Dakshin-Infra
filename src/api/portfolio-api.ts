import { getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  PortfolioResponse,
  InvestmentSummaryResponse,
} from "../api/models/portfolio.model";

export const portfolioApi = {
  getPortfolio: () =>
    getAxiosClient.get<PortfolioResponse>(ENDPOINTS.USER.PORTFOLIO),

  getInvestmentSummary: () =>
    getAxiosClient.get<InvestmentSummaryResponse>(ENDPOINTS.USER.INVESTMENT_SUMMARY),
};