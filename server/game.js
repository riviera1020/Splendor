// TODO
/*
	object template?
	random draw
	token and currency
	justify money enough
	preserve card
	royal left to next commit

	card template
	{type:"Diamond",score:1,price:{token}}
*/

const Deck = require('./Splendor.json');

exports = module.exports = function createGame() {
  const token = () => ({ Emerald: 0, Sapphire: 0, Ruby: 0, Diamond: 0, Agate: 0, Gold: 0 });

  const createUser = (socket) => ({ token: token(), score: 0, currency: token(), socket });

  const win = 15;
  let curCard = { top: [], mid: [], bot: [], nobel: [] };


  let users = [];
	// curUser = 4 for win
  let curUser = 0;

  const curToken = { Emerald: 7, Sapphire: 7, Ruby: 7, Diamond: 7, Agate: 7, Gold: 5 };
  const deck = Deck;

  const addUser = (socket) => {
    users = users.push(createUser(socket));
    users.forEach((user) => { console.log(user.socket.id); });
  };

  const getUsers = () => users;
  const getCurUser = () => {
    console.log(curUser);
    return users[curUser];
  };
  const nextTurn = () => { curUser = (curUser === users.length - 1) ? 0 : curUser + 1; };
  const getCurCard = () => ({ top: curCard.top, mid: curCard.mid, bot: curCard.bot });
  const getCurToken = () => curToken;
  const getNobel = () => curCard.nobel;

  const drawCard = (where) => {
    // if (deck[where].length === 0) return 0;
    const rand = Math.floor(Math.random() * deck[where].length);
    const target = deck[where][rand];
    deck[where][rand] = deck[where][deck[where].length - 1];
    deck[where].pop();
    return target;
  };

  const initDraw = () => {
    curCard = {
      top: [drawCard('top'), drawCard('top'), drawCard('top'), drawCard('top')],
      mid: [drawCard('mid'), drawCard('mid'), drawCard('mid'), drawCard('mid')],
      bot: [drawCard('bot'), drawCard('bot'), drawCard('bot'), drawCard('bot')],
      nobel: [drawCard('nobel'), drawCard('nobel'), drawCard('nobel'),
      drawCard('nobel'), drawCard('nobel')],
    };
  };

  const checkout = (cards) => {
    users[curUser].currency[cards.type] += 1;
    const tempCards = cards;
    const need = tempCards.price.reduce((owned, price) => {
      const key = price.key;
      if (key !== 'Gold') {
        const pay = price - users[curUser].currency[key];
        if (pay > 0) {
          if (pay <= users[curUser].token[key]) {
            users[curUser].token[key] -= price;
          } else {
            return owned + (price - users[curUser].token[key]);
          }
        }
      }
      return owned;
    }, 0);
    users[curUser].token.Gold -= need;
  };
	// TODO front_end render no card(null)
  const score = (card) => {
    users[curUser].score += card.score;
    if (users[curUser].score > win) {
      curUser = 4;
    }
  };

  const takeToken = (types) => {
    if (types.length === 3) {
      types.forEach((type) => {
        curToken[type] -= 1;
        users[curUser].token[type] += 1;
      });
    } else if (types.length === 1) {
      curToken[types[0]] -= 2;
      users[curUser].token[types[0]] += 2;
    }
  };
  const takeCard = (pos, index) => {
    checkout(curCard[pos][index]);
    score(curCard[pos][index]);
    if (deck[pos].length !== 0) {
      curCard[pos][index] = drawCard(pos);
    } else {
      curCard[pos].splice(index, 1);
    }
		// token_back(price);
  };
	// do server need to know price?
	// return method
  return {
    initDraw,
    nextTurn,
    getUsers,
    getCurUser,
    getCurCard,
    getCurToken,
    getNobel,
    takeCard,
    checkout,
    score,
    drawCard,
    takeToken,
    addUser,
    // for testing no allowed to take
    deck,
    curToken,
    users,
    curCard,
  };
};
