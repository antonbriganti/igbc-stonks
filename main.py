import csv
from copy import deepcopy
from collections import defaultdict
from pprint import pprint

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
        self.history = []
    
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

    def save_history(self):
        self.history.append(deepcopy(self.stocks))

def shareholder_report(shareholder, market):
    print(f"Name: {shareholder.name}")
    print(f"Total portfolio value: {shareholder.calculate_portfolio_value(market)}")
    report = {}
    for stock_name in shareholder.portfolio:
        report[stock_name] = {"shares held": shareholder.portfolio[stock_name], "value": market.get_stock_value(stock_name) * shareholder.portfolio[stock_name]}
    
    pprint(report)


def market_report(market):
    print(f"Total Market Cap: {market.get_total_market_value}")


def main():
    market = Market()
    shareholders = {}

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
                market.save_history()
                session_number = nominated_session

            if not skip:
                market.update_stock(game_name, votes)

                if nominator not in shareholders:
                    shareholders[nominator] = Shareholder(nominator)
                shareholders[nominator].update_portfolio(game_name)
                    
                if victory:
                    market.clear_stock_value(game_name)

    # for session in market.history:
    #     pprint(session)
    #     input()

    for sh in shareholders.values():
        shareholder_report(sh, market)
    sorted(market.stocks.values(), key=lambda x: x.get_market_cap(), reverse=True)

if __name__ == "__main__":
    main()
