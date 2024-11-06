function add(a: number, b: number) {
  if (a === 1) {
    throw new Error("xxx");
  }
  return a + b;
}

function main() {
  console.log(add(1, 2));
}

main();
