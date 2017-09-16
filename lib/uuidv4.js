function randomHexByte() {
  const hexByte = Math.floor(Math.random() * 256).toString(16);

  return hexByte.length === 2 ? hexByte : `0${hexByte}`;
}

function bytes(num) {
  let randomHex = '';

  for (let i = 0; i < num; i++) {
    randomHex += randomHexByte();
  }

  return randomHex;
}

function special() {
  return ['8', '9', 'a', 'b'][Math.floor(Math.random() * 4)];
}

export default function uuidv4() {
  return `${bytes(4)}-${bytes(2)}-4${bytes(3)}-${special()}${bytes(3)}-${bytes(6)}`;
}
