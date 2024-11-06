## Run

## terminal 1

```
npx tsc -w
```

## terminal 2

### Original error stack

```
node ./dist/index.js
```

### Customized error stack

```
node --import ./dist/register.js ./dist/index.
```

```
--import means  import the module before running the script (es module)
```
