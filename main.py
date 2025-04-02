import csv
from collections import defaultdict
from pprint import pprint

def calculate_portfolio_value(portfolio, market_state):
    pf_value = 0
    for game in portfolio.keys():
        pf_value += market_state[game] * portfolio[game]
    
    return pf_value


def main():
    historical_market = []
    historial_owners = []
    market = {}
    owners = {}



    with open('data/nomination_data.csv', 'r', newline='') as csvfile:
        csv_reader = csv.reader(csvfile, delimiter=',')
        session_number = 1

        for game in csv_reader: 
            game_name = game[0]
            nominator = game[1]
            votes = int(game[2])
            victory = True if game[3] == "Y" else False
            nominated_session = int(game[4])

            # capture market state for future use
            if session_number != nominated_session:
                historical_market.append(dict(market))
                historial_owners.append(dict(owners))
                session_number = nominated_session


            if game_name in market.keys():
                market[game_name] += votes
            else:
                market[game_name] = votes

            if nominator in owners.keys():
                if game_name in owners[nominator].keys():
                    owners[nominator][game_name] += 1
                else:
                    owners[nominator][game_name] = 1
            else:
                owners[nominator] = {game_name: 1}

            if victory:
                market[game_name] = 0

    money = {}
    for owner in owners.keys():
        owner_pf = owners[owner]
        owner_pf_value = calculate_portfolio_value(owner_pf, market)
        money[owner] = owner_pf_value

        

    pprint(market)
    pprint(owners)
    pprint(money)
    # pprint(dict(money))


if __name__ == "__main__":
    main()
