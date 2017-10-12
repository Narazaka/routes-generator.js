# [routes-generator.js](https://github.com/Narazaka/routes-generator.js)

REST like URL routes generator for frontend (for react-router etc)

## Install

```
npm install routes-generator
```

## Usage

- **[API Document](https://narazaka.github.io/routes-generator.js/)**

```typescript
import { both, collection, member, routes } from "./routes-generator";

const r = routes({
    config: collection({
        flag: collection(),
    }),
    items: both(
        collection({
            new: collection(),
        }),
        member({
            edit: collection(),
        }),
    ),
    users: both(
        collection(),
        member(),
    ),
});

console.log(r.config().flag()); // "/config/flag"
console.log(r.items().toString()); // "/items"
console.log(r.items(1).toString()); // "/items/1"
console.log(r.items().new()); // "/items/new"
console.log(r.items(1).edit()); // "/items/1/edit"
```

## License

This is released under [MIT License](https://narazaka.net/license/MIT?2017).
