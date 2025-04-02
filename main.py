import csv
from collections import defaultdict
from pprint import pprint

class Stock:
    def __init__(self, name, price):
        self.name = name
        self.share_price = price
        self.total_distributed = 1
    
    def get_market_cap(self):
        return self.share_price * self.total_distributed

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
        self.total_value = 0
        self.stocks = {}
    
    def update_stock(self, stock_name, votes):
        if stock_name in self.stocks:
            self.stocks[stock_name].share_price += votes
            self.stocks[stock_name].total_distributed += 1
        else:
            self.stocks[stock_name] = Stock(stock_name, votes)
        
        self.total_value += votes
    
    def clear_stock_value(self, stock_name):
        self.total_value -= self.stocks[stock_name].share_price
        self.stocks[stock_name].share_price = 0
    
    def get_stock_value(self, stock_name):
        return self.stocks[stock_name].share_price

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

            market.update_stock(game_name, votes)

            if nominator not in shareholders:
                shareholders[nominator] = Shareholder(nominator)
            shareholders[nominator].update_portfolio(game_name)
                
            if victory:
                market.clear_stock_value(game_name)

    for sh in shareholders.values():
        print(sh.name)
        print(f"Total portfolio value: {sh.calculate_portfolio_value(market)}")
        print("Portfolio held:")
        pprint(dict(sh.portfolio))
        print()

        

    # pprint(market)
    # pprint(owners)


if __name__ == "__main__":
    main()
