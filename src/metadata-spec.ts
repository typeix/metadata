import {
    createClassDecorator,
    createMethodDecorator,
    createParameterAndPropertyDecorator,
    createPropertyDecorator,
    getClassMetadata,
    getDecoratorId, getAllMetadataForTarget, getAllMetadataKeysForTarget,
    getMethodMetadata,
    getParameterMetadata,
    getPropertyMetadata,
    hasDecorator, getMetadataForTarget, getMetadataKeysForTarget, IMetadata,
} from "./metadata";

describe("Decorators", () => {

    test("ClassDecorator", () => {
        let Injectable = () => createClassDecorator(Injectable);

        @Injectable()
        class BService {
        }

        expect(getClassMetadata(Injectable, BService)).toStrictEqual({
            args: {},
            type: "constructor",
            metadataKey: getDecoratorId(Injectable),
            decoratorType: "constructor",
            propertyKey: "constructor",
            decorator: Injectable
        });
        expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor");
        expect(hasDecorator(Injectable, BService)).toBeTruthy();
    });

    test("ClassDecorator with Args", () => {
        let Injectable = (...args: any) => createClassDecorator(Injectable, args);

        @Injectable("Custom", "Arguments")
        class BService {
        }


        expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
        expect(hasDecorator(Injectable, BService)).toBeTruthy();
        expect(getClassMetadata(Injectable, BService)).toStrictEqual({
            args: {0: "Custom", 1: "Arguments"},
            metadataKey: getDecoratorId(Injectable),
            decorator: Injectable,
            decoratorType: "constructor",
            propertyKey: "constructor",
            type: "constructor"
        });
    });

    test("ClassDecorator with Named Args", () => {
        let Injectable = (token, name) => createClassDecorator(Injectable, {token, name});

        @Injectable("Custom", "Arguments")
        class BService {
        }


        expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
        expect(hasDecorator(Injectable, BService)).toBeTruthy();
        expect(getClassMetadata(Injectable, BService)).toStrictEqual({
            args: {token: "Custom", name: "Arguments"},
            metadataKey: getDecoratorId(Injectable),
            decorator: Injectable,
            decoratorType: "constructor",
            propertyKey: "constructor",
            type: "constructor"
        });
    });


    test("PropertyDecorator with Args", () => {
        let Injectable = () => createClassDecorator(Injectable);
        let Inject = (token: Function) => createPropertyDecorator(Inject, {token});

        @Injectable()
        class AService {
        }

        class BService {
            @Inject(AService)
            publicProperty: AService;
        }


        expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
        expect(getDecoratorId(Inject)).toMatch("@typeix:property:Inject");
        let decorator = getPropertyMetadata(Inject, BService, "publicProperty");
        expect(decorator).toStrictEqual({
            args: {
                token: AService
            },
            metadataKey: getDecoratorId(Inject),
            decoratorType: "property",
            propertyKey: "publicProperty",
            decorator: Inject,
            designType: AService,
            type: "property"
        });
    });

    test("Parameter with Args", () => {
        let Injectable = () => createClassDecorator(Injectable);
        let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});

        @Injectable()
        class AService {
        }

        class BService {
            @Inject() publicProperty: AService;

            constructor(@Inject() firstProperty: AService) {
            }


            publicMethod(
                @Inject() firstProperty: AService,
                @Inject(AService) secondProperty: AService,
                thirdProperty: string
            ) {
            }

        }

        expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
        expect(getDecoratorId(Inject)).toMatch("@typeix:mixed:Inject");

        let decorator = getPropertyMetadata(Inject, BService, "publicProperty");
        expect(decorator).toStrictEqual({
            args: {token: undefined},
            metadataKey: getDecoratorId(Inject),
            decoratorType: "mixed",
            propertyKey: "publicProperty",
            designType: AService,
            decorator: Inject,
            type: "property"
        });

        decorator = getParameterMetadata(Inject, BService, 0, "publicMethod");
        expect(decorator).toStrictEqual({
            args: {token: undefined},
            designType: Function,
            designParam: [
                AService,
                AService,
                String
            ],
            decorator: Inject,
            decoratorType: "mixed",
            metadataKey: getDecoratorId(Inject, 0),
            propertyKey: "publicMethod",
            paramIndex: 0,
            designReturn: undefined,
            type: "parameter"
        });

        let name = getDecoratorId(Inject, 1);
        decorator = getParameterMetadata(Inject, BService, 1, "publicMethod");
        expect(decorator).toStrictEqual({
            args: {token: AService},
            designType: Function,
            designParam: [
                AService,
                AService,
                String
            ],
            decoratorType: "mixed",
            metadataKey: name,
            propertyKey: "publicMethod",
            paramIndex: 1,
            decorator: Inject,
            designReturn: undefined,
            type: "parameter"
        });
    });

    test("Parameter static parameter error", () => {
        let Injectable = () => createClassDecorator(Injectable);
        let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});

        @Injectable()
        class AService {
        }

        expect(getDecoratorId(Injectable)).toMatch("@typeix:constructor:Injectable");
        expect(() => {
            class BService {
                static staticMethod(
                    @Inject() firstProperty: AService,
                    @Inject(AService) secondProperty: AService,
                    thirdProperty: string
                ) {
                }
            }
        }).toThrow("Decorator can´t be declared on static method/property: staticMethod");

        expect(() => {
            class BService {
                @Inject() static staticProperty: AService;
            }
        }).toThrow("Decorator can´t be declared on static method/property: staticProperty");
    });


    test("Method decorator", () => {
        let Injectable = () => createClassDecorator(Injectable);
        let Inject = (token?) => createMethodDecorator(Inject, {token});

        @Injectable()
        class AService {
        }

        class BService {

            @Inject()
            methodDecoratorString(): string {
                return "string"
            }

            @Inject()
            methodDecorator() {
            }

            @Inject()
            static staticDecorator() {
            }
        }

        expect(getDecoratorId(Inject)).toMatch("@typeix:method:Inject");
        let decorator = getMethodMetadata(Inject, BService, "methodDecorator");
        expect(decorator).toStrictEqual({
            args: {token: undefined},
            type: "method",
            designParam: [],
            decoratorType: "method",
            decorator: Inject,
            metadataKey: getDecoratorId(Inject),
            propertyKey: "methodDecorator",
            designReturn: undefined,
            designType: Function
        });

        decorator = getMethodMetadata(Inject, BService, "methodDecoratorString");
        expect(decorator).toStrictEqual({
            args: {token: undefined},
            type: "method",
            designParam: [],
            decoratorType: "method",
            decorator: Inject,
            metadataKey: getDecoratorId(Inject),
            propertyKey: "methodDecoratorString",
            designReturn: String,
            designType: Function
        });

        decorator = getMethodMetadata(Inject, BService, "staticDecorator", true);
        expect(decorator).toStrictEqual({
            args: {token: undefined},
            type: "static",
            designParam: [],
            decoratorType: "method",
            decorator: Inject,
            metadataKey: getDecoratorId(Inject),
            propertyKey: "staticDecorator",
            designReturn: undefined,
            designType: Function
        });
    });


    test("Get Decorator Metadata", () => {
        let Injectable = () => createClassDecorator(Injectable);
        let Inject = (token?) => createParameterAndPropertyDecorator(Inject, {token});

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

            publicMethod(
                @Inject() firstProperty: AService,
                @Inject(AService) secondProperty: AService,
                thirdProperty: string
            ) {
            }
        }

        @Injectable()
        class CService extends BService {
            @Inject() cServiceProperty: AService;

            constructor(@Inject() cServiceConst: AService, @Inject() dServiceConst: DService) {
                super(cServiceConst);
            }

            publicMethod(
                @Inject() firstProperty: AService,
                @Inject(AService) secondProperty: AService,
                thirdProperty: string
            ) {
            }
        }

        let keys = getAllMetadataKeysForTarget(CService);
        expect(keys).toStrictEqual([
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: "design:paramtypes"
            },
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: getDecoratorId(Inject, 1)
            },
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: getDecoratorId(Inject, 0)
            },
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: getDecoratorId(Injectable)
            },
            {
                propertyKey: "publicMethod",
                target: CService.prototype,
                metadataKey: "design:returntype"
            },
            {
                propertyKey: "publicMethod",
                target: CService.prototype,
                metadataKey: "design:paramtypes"
            },
            {
                propertyKey: "publicMethod",
                target: CService.prototype,
                metadataKey: "design:type"
            },
            {
                propertyKey: "publicMethod",
                target: CService.prototype,
                metadataKey: getDecoratorId(Inject, 1)
            },
            {
                propertyKey: "publicMethod",
                target: CService.prototype,
                metadataKey: getDecoratorId(Inject, 0)
            },
            {
                propertyKey: "cServiceProperty",
                target: CService.prototype,
                metadataKey: "design:type"
            },
            {
                propertyKey: "cServiceProperty",
                target: CService.prototype,
                metadataKey: getDecoratorId(Inject)
            },
            {
                propertyKey: "bServiceProperty",
                target: BService.prototype,
                metadataKey: "design:type"
            },
            {
                propertyKey: "bServiceProperty",
                target: BService.prototype,
                metadataKey: getDecoratorId(Inject)
            }
        ]);

        let metadata = getAllMetadataForTarget(CService);
        expect(metadata).toStrictEqual([
            {
                args: [
                    AService,
                    DService
                ],
                "metadataKey": "design:paramtypes",
                "propertyKey": undefined,
            },
            {
                args: {
                    token: undefined
                },
                "decoratorType": "mixed",
                decorator: Inject,
                "type": "parameter",
                "metadataKey": getDecoratorId(Inject, 1),
                "paramIndex": 1,
                "propertyKey": "constructor",
                "designParam": [
                    AService,
                    DService
                ]
            },
            {
                "args": {
                    token: undefined
                },
                "decoratorType": "mixed",
                decorator: Inject,
                "type": "parameter",
                "metadataKey": getDecoratorId(Inject, 0),
                "paramIndex": 0,
                "propertyKey": "constructor",
                "designParam": [
                    AService,
                    DService
                ]
            },
            {
                "args": {},
                "decoratorType": "constructor",
                "type": "constructor",
                decorator: Injectable,
                "metadataKey": getDecoratorId(Injectable),
                "propertyKey": "constructor",
                "designParam": [
                    AService,
                    DService
                ]
            },
            {
                "args": undefined,
                "metadataKey": "design:returntype",
                "propertyKey": "publicMethod"
            },
            {
                "args": [
                    AService,
                    AService,
                    String
                ],
                "metadataKey": "design:paramtypes",
                "propertyKey": "publicMethod"
            },
            {
                "args": Function,
                "metadataKey": "design:type",
                "propertyKey": "publicMethod"
            },
            {
                "args": {
                    token: AService
                },
                "decoratorType": "mixed",
                "type": "parameter",
                decorator: Inject,
                "metadataKey": getDecoratorId(Inject, 1),
                "paramIndex": 1,
                designReturn: undefined,
                designType: Function,
                "propertyKey": "publicMethod",
                "designParam": [
                    AService,
                    AService,
                    String
                ]
            },
            {
                "args": {
                    token: undefined
                },
                "decoratorType": "mixed",
                "type": "parameter",
                decorator: Inject,
                "metadataKey": getDecoratorId(Inject, 0),
                "paramIndex": 0,
                designReturn: undefined,
                designType: Function,
                "propertyKey": "publicMethod",
                "designParam": [
                    AService,
                    AService,
                    String
                ]
            },
            {
                "args": AService,
                "metadataKey": "design:type",
                "propertyKey": "cServiceProperty"
            },
            {
                "args": {
                    token: undefined
                },
                "decoratorType": "mixed",
                "type": "property",
                designType: AService,
                decorator: Inject,
                "metadataKey": getDecoratorId(Inject),
                "propertyKey": "cServiceProperty"
            },
            {
                "args": AService,
                "metadataKey": "design:type",
                "propertyKey": "bServiceProperty"
            },
            {
                "args": {
                    token: undefined
                },
                "decoratorType": "mixed",
                "type": "property",
                designType: AService,
                decorator: Inject,
                "metadataKey": getDecoratorId(Inject),
                "propertyKey": "bServiceProperty"
            }
        ]);
    });


    test("Get Constructor Metadata", () => {
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
                thirdProperty: string
            ) {
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
                thirdProperty: string
            ) {
            }
        }

        let keys = getMetadataKeysForTarget(CService);
        expect(keys).toStrictEqual([
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: "design:paramtypes"
            },
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: getDecoratorId(Inject, 1)
            },
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: getDecoratorId(Inject, 0)
            },
            {
                propertyKey: undefined,
                target: CService,
                metadataKey: getDecoratorId(Injectable)
            }
        ]);

        let metadata: Array<IMetadata> = getMetadataForTarget(CService);
        expect(metadata).toStrictEqual([
            {
                "args": [
                    AService,
                    DService
                ],
                "propertyKey": undefined,
                "metadataKey": "design:paramtypes"
            },
            {
                args: {
                    token: undefined
                },
                "decoratorType": "mixed",
                decorator: Inject,
                "type": "parameter",
                "metadataKey": getDecoratorId(Inject, 1),
                "paramIndex": 1,
                "propertyKey": "constructor",
                "designParam": [
                    AService,
                    DService
                ]
            },
            {
                "args": {
                    token: undefined
                },
                "decoratorType": "mixed",
                decorator: Inject,
                "type": "parameter",
                "metadataKey": getDecoratorId(Inject, 0),
                "paramIndex": 0,
                "propertyKey": "constructor",
                "designParam": [
                    AService,
                    DService
                ]
            },
            {
                "args": {},
                "decoratorType": "constructor",
                "type": "constructor",
                decorator: Injectable,
                "metadataKey": getDecoratorId(Injectable),
                "propertyKey": "constructor",
                "designParam": [
                    AService,
                    DService
                ]
            }
        ]);

        keys = getMetadataKeysForTarget(CService, "publicMethod");
        expect(keys).toStrictEqual([
            {
                "metadataKey": "design:returntype",
                "propertyKey": "publicMethod",
                "target":  CService.prototype,
            },
            {
                "metadataKey": "design:paramtypes",
                "propertyKey": "publicMethod",
                "target":  CService.prototype,
            },
            {
                "metadataKey": "design:type",
                "propertyKey": "publicMethod",
                "target": CService.prototype,
            },
            {
                "propertyKey": "publicMethod",
                "target": CService.prototype,
                "metadataKey": getDecoratorId(Inject, 1)
            },
            {
                "propertyKey": "publicMethod",
                "target": CService.prototype,
                "metadataKey": getDecoratorId(Inject, 0)
            },
            {
                "propertyKey": "publicMethod",
                "target": CService.prototype,
                "metadataKey": getDecoratorId(Produces)
            }
        ]);
        metadata = getMetadataForTarget(CService, "publicMethod");
        expect(metadata).toStrictEqual([
            {
                "args": undefined,
                "metadataKey": "design:returntype",
                "propertyKey": "publicMethod"
            },
            {
                "args": [
                    AService,
                    AService,
                    String
                ],
                "metadataKey": "design:paramtypes",
                "propertyKey": "publicMethod"
            },
            {
                "args": Function,
                "metadataKey": "design:type",
                "propertyKey": "publicMethod"
            },
            {
                args: {
                    token: AService
                },
                "decoratorType": "mixed",
                decorator: Inject,
                "type": "parameter",
                "metadataKey": getDecoratorId(Inject, 1),
                "paramIndex": 1,
                "propertyKey": "publicMethod",
                designReturn: undefined,
                designType: Function,
                "designParam": [
                    AService,
                    AService,
                    String
                ]
            },
            {
                "args": {
                    token: undefined
                },
                "decoratorType": "mixed",
                decorator: Inject,
                "type": "parameter",
                "metadataKey": getDecoratorId(Inject, 0),
                "paramIndex": 0,
                "propertyKey": "publicMethod",
                designReturn: undefined,
                designType: Function,
                "designParam": [
                    AService,
                    AService,
                    String
                ]
            },
            {
                "args": {
                    "type": "/nice/"
                },
                "decoratorType": "method",
                "type": "method",
                decorator: Produces,
                "metadataKey": getDecoratorId(Produces),
                designReturn: undefined,
                designType: Function,
                "propertyKey": "publicMethod",
                "designParam": [
                    AService,
                    AService,
                    String
                ]
            }
        ]);
    });


});
