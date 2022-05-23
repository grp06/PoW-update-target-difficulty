const fs = require('fs');

const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const UTXO = require('./models/UTXO');
const db = require('./db');
const {PUBLIC_KEY} = require('./config');
const TARGET_DIFFICULTY = BigInt("0x0" + "F".repeat(63));
const BLOCK_REWARD = 10;

let mining = true;
mine();

function startMining() {
  mining = true;
  mine();
}

function stopMining() {
  mining = false;
}

async function mine() {
  if(!mining) return;

  const block = new Block();

  // TODO: add transactions from the mempool

  const coinbaseUTXO = new UTXO(PUBLIC_KEY, BLOCK_REWARD);
  const coinbaseTX = new Transaction([], [coinbaseUTXO]);
  block.addTransaction(coinbaseTX);

  const getTargetDifficulty = () => {
    return new Promise((resolve, reject) => {
      fs.readFile('blockchain.json', (err, data) => {
        if (err) throw err;
        const parsedData = JSON.parse(data) || null
        console.log("🚀 ~ fs.readFile ~ parsedData", parsedData)
        if (parsedData.length > 1) {
          const prevDifficulty = parsedData[parsedData.length - 1].targetDifficulty
          const lastBlockTimestamp = parsedData[parsedData.length - 1].timestamp
          const twoBlocksAgoTimestamp = parsedData[parsedData.length - 2].timestamp
          
          const diff = lastBlockTimestamp - twoBlocksAgoTimestamp
          console.log("🚀 ~ fs.readFile ~ diff", diff)
          
          
          if (diff < 6000) {
            const newDifficulty = parsedData[parsedData.length - 1].targetDifficulty + 1
            block.targetDifficulty = newDifficulty
            const defaultDifficultyString = "0x" + "0".repeat(newDifficulty) + "F".repeat(64 - newDifficulty)
            resolve(defaultDifficultyString)
          } else if (diff > 6000 && diff < 15000) {
            const defaultDifficultyString = "0x" + "0".repeat(prevDifficulty) + "F".repeat(64 - prevDifficulty)
            resolve(defaultDifficultyString)            
            block.targetDifficulty = parsedData[parsedData.length - 1].targetDifficulty
          } else {
            const newDifficulty = parsedData[parsedData.length - 1].targetDifficulty - 1
            block.targetDifficulty = newDifficulty
            const defaultDifficultyString = "0x" + "0".repeat(newDifficulty) + "F".repeat(64 - newDifficulty)
            resolve(defaultDifficultyString)
          }

        } else {

          console.log('default');
          block.targetDifficulty = 1
          resolve(TARGET_DIFFICULTY)
        }
      })
    })
    
  }

  const calculatedDifficulty = await getTargetDifficulty()

  while(BigInt('0x' + block.hash()) >= calculatedDifficulty) {
    block.nonce++;
  }

  block.execute();
  block.timestamp = Date.now()
  db.blockchain.addBlock(block);

  console.log(`Mined block #${db.blockchain.blockHeight()} with a hash of ${block.hash()} at nonce ${block.nonce}`);

  setTimeout(mine, 1000);
}

module.exports = {
  startMining,
  stopMining,
};
