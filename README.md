# @typeix/metadata
Metadata API for typescript decorators

# Installing:
```bash
npm i @typeix/metadata --save
```

## Creating Decorators with easier API
```typescript
let Injectable = () => createClassDecorator(Injectable);
let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});
let Produces = (type) => createMethodDecorator(Produces, {type});
let ReCheck = (type) => createMethodDecorator(Produces, {type});

@Injectable()
class AService {
}

@Injectable()
class DService {
}

@Injectable()
class BService {
    @Inject() bServiceProperty: AService;
    
    constructor(@Inject() bServiceConst: AService) {
    }

    @Produces("application/json")
    publicMethod(
        @Inject() firstProperty: AService,
        @Inject(AService) secondProperty: AService,
        thirdProperty: string) {
    }
}

@Injectable()
class CService extends BService {
    @Inject() cServiceProperty: AService;

    constructor(@Inject() cServiceConst: AService, @Inject() dServiceConst: DService) {
        super(cServiceConst);
    }

    @ReCheck("/nice/")
    publicMethod(
        @Inject() firstProperty: AService,
        @Inject(AService) secondProperty: AService,
        thirdProperty: string) {
    }
}

let metadata: Array<IMetadata> = getAllMetadataForTarget(CService);
```

## Dev packages
```
npm i typescript ts-jest jest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin-tslint @typescript-eslint/eslint-plugin @types/node @types/jest --save-dev
```
