const flatten = arr => [].concat(...arr);

const MAX_LENGTH = 10;
const nums = [1, 2, 3, 4]; // [1, 2, 3, 4];

const ops = {
  ADD: (a, b) => a + b,
  SUBTRACT: (a, b) => a - b,
  MULTIPLY: (a, b) => a * b,
  DIVIDE: (a, b) => a / b,
  POWER: (a, b) => Math.pow(a, b),
  ROOT: (a, b) => Math.pow(a, 1 / b),
  // SQUARE: a => a * a,
  FACTORIAL: a => {
    if (a > 100) {
      return Infinity;
    }
    let acc = 1;
    for (let i = 1; i <= a; i++) {
      acc = acc * i;
    }
    return acc;
  },
};

const getOpArity = opName => ops[opName].length;
const getSeqStackCount = seq => {
  let stackCount = 0;
  seq.forEach(item => {
    if (typeof item === 'number') {
      stackCount++;
    } else if (ops[item]) {
      if (stackCount < getOpArity(item)) {
        throw new Error(`Bad stack: ${JSON.stringify(seq)}`);
      }
      stackCount -= getOpArity(item) - 1;
    }
  });
  return stackCount;
};

const getRemainingPermutations = (availNums, opNames, soFar = []) => {
  if (soFar.length >= MAX_LENGTH) return [soFar];
  //console.log('getRemainingPermutations', {availNums, soFar});

  // if (availNums.length === 0) return soFar;
  const stackCount = getSeqStackCount(soFar);
  // console.log({ soFar, stackCount })
  const result = [soFar];

  if (stackCount < 2) {
    availNums.forEach(num => {
      const remainingNums = availNums.filter(n => n !== num);
      result.push(
        ...getRemainingPermutations(remainingNums, opNames, [...soFar, num]),
      );
    });
  }
  opNames.filter(op => stackCount >= getOpArity(op)).forEach(op => {
    result.push(
      ...getRemainingPermutations(availNums, opNames, [...soFar, op]),
    );
  });

  return result;
};

//console.log(Object.keys(ops).map(op => [op, getOpArity(op)]))
const allSeqs = getRemainingPermutations(nums, Object.keys(ops))
  .filter(seq => seq.length > 0)
  .sort((a, b) => a.length - b.length);
const resultToSeq = new Map();

const calculateSeq = originalSeq => {
  const seq = originalSeq.slice();
  const stack = [];
  let next;
  while ((next = seq.shift())) {
    if (typeof next === 'number') {
      stack.push(next);
    } else if (ops[next]) {
      const op = ops[next];
      const arity = getOpArity(next);
      if (arity === 1) {
        stack.push(ops[next](stack.pop()));
      } else if (arity === 2) {
        stack.push(ops[next](stack.pop(), stack.pop()));
      } else {
        throw new Error(`bad arity ${arity}`);
      }
    } else {
      throw new Error('wtf is ' + next);
    }
  }
  return stack.pop();
};

allSeqs.forEach(seq => {
  const result = calculateSeq(seq);
  //console.log(result, seq);
  if (
    !resultToSeq.has(result) &&
    result >= 0 &&
    result <= 100 &&
    result === Math.round(result)
  ) {
    resultToSeq.set(result, seq);
  }
});

const results = Array.from(resultToSeq.entries()).sort((a, b) => a[0] - b[0]);
console.log(results);
console.log(results.length);
