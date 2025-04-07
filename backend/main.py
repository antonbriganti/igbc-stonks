import csv
import json
from pprint import pprint
from collections import defaultdict


class Stock:
    def __init__(self, name, price):
        self.name = name
        self.share_price = price
        self.total_distributed = 1
    
    def get_market_cap(self):
        return self.share_price * self.total_distributed

    def __repr__(self):
        return str(self.share_price)

class Shareholder:
    def __init__(self, name):
        self.name = name
        self.portfolio = defaultdict(int)
    
    def update_portfolio(self, stock_name):
        self.portfolio[stock_name] += 1
    
    def calculate_portfolio_value(self, market):
        pf_total_value = 0
        for stock in self.portfolio:
            pf_total_value += market.get_stock_value(stock) * self.portfolio[stock]
        
        return pf_total_value

class Market:
    def __init__(self):
        self.stocks = {}
        self.shareholders = {}
        self.stock_history = defaultdict(dict)
        # self.shareholder_history = defaultdict(defaultdict(list))
    
    def get_stock_value(self, stock_name):
        return self.stocks[stock_name].share_price
    
    def update_stock(self, stock_name, votes):
        if stock_name in self.stocks:
            self.stocks[stock_name].share_price += votes
            self.stocks[stock_name].total_distributed += 1
        else:
            self.stocks[stock_name] = Stock(stock_name, votes)
        
    def clear_stock_value(self, stock_name):
        self.stocks[stock_name].share_price = 0
    
    def get_total_market_value(self):
        total = 0
        for stock in self.stocks.values():
            total += stock.get_market_cap()
        return total

    def save_history(self, session):
        for stock_name in self.stocks:
            self.stock_history[stock_name][session] = self.stocks[stock_name].share_price

        

def shareholder_report(shareholder, market):
    report = {}
    report["name"] = shareholder.name
    report["portfolio_value"] = shareholder.calculate_portfolio_value(market)
    portfolio = {}
    for stock_name in shareholder.portfolio:
        portfolio[stock_name] = {"shares held": shareholder.portfolio[stock_name], "value": market.get_stock_value(stock_name) * shareholder.portfolio[stock_name]}

    report["portfolio"] = portfolio
    return report


def market_report(market):
    print(f"Total Market Cap: {market.get_total_market_value}")

def main():
    market = Market()

    with open('data/nomination_data.csv', 'r', newline='') as csvfile:
        csv_reader = csv.reader(csvfile, delimiter=',')
        session_number = 1

        for game in csv_reader: 
            game_name = game[0]
            nominator = game[1]
            votes = int(game[2])
            victory = True if game[3] == "Y" else False
            nominated_session = int(game[4])
            skip = True if game[5] == "Y" else False

            if session_number != nominated_session:
                market.save_history(session_number)
                session_number = nominated_session

            if not skip:
                market.update_stock(game_name, votes)

                if nominator not in market.shareholders:
                    market.shareholders[nominator] = Shareholder(nominator)
                market.shareholders[nominator].update_portfolio(game_name)
                    
                if victory:
                    market.clear_stock_value(game_name)
    
    market.save_history(session_number)

    with open('frontend/stockdata.json', 'w') as stockdata:
        json.dump(market.stock_history, stockdata)
    
    shareholder_reports = []
    for sh in market.shareholders.values():
        shareholder_reports.append(shareholder_report(sh, market))
    
    with open('frontend/sharedata.json', 'w') as sharedata:
        json.dump(shareholder_reports, sharedata)

    # sorted(market.stocks.values(), key=lambda x: x.get_market_cap(), reverse=True)

if __name__ == "__main__":
    main()
