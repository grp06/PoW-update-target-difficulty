const fs = require('fs');

class Blockchain {
  constructor() {
    this.blocks = [];
    fs.writeFileSync('blockchain.json', JSON.stringify([]), (err) => {
      if (err) throw err;
    });
  }
  addBlock(block) {
    this.blocks.push(block);

    fs.writeFileSync('blockchain.json', JSON.stringify(this.blocks), (err) => {
      if (err) throw err;
    });
    
  }
  blockHeight() {
    return this.blocks.length;
  }
}

module.exports = Blockchain;
