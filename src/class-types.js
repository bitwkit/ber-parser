
// definition of basic class and type names and parsers for some of types

const CLASS_TYPES = {
    0b00: {
        name: "Universal",
        types: {
            // 0: "Reserved for use by the encoding rules",
            1: { name: "Boolean" },
            2: { name: "Integer" },
            3: { name: "Bitstring" },
            4: { name: "Octetstring" },
            5: { name: "Null" },
            6: { name: "Object identifier" },
            7: { name: "Object descriptor" },
            8: { name: "External / Instance-of" },
            9: { name: "Real" },
            10: { name: "Enumerated" },
            11: { name: "Embedded-pdv" },
            12: { name: "UTF8String" },
            13: { name: "Relative object identifier" },
            14: { name: "The time" },
            // 15: "Reserved for future editions of this Recommendation | International Standard" },
            16: { name: "Sequence / Sequence-of" },
            17: { name: "Set / Set-of" },
            18: { name: "Character string" },
            19: { name: "Character string" },
            20: { name: "Character string" },
            21: { name: "Character string" },
            22: { name: "Character string" },
            25: { name: "Character string" },
            26: { name: "Character string" },
            27: { name: "Character string" },
            28: { name: "Character string" },
            29: { name: "Character string" },
            30: { name: "Character string" },
            23: { name: "UTCTime" },
            24: { name: "GeneralizedTime" },
            31: { name: "DATE" },
            32: { name: "TIME-OF-DAY" },
            33: { name: "DATE-TIME" },
            34: { name: "DURATION" },
            35: { name: "OID internationalized resource identifier" },
            36: { name: "Relative OID internationalized resource identifier" }
            // 37-... "Reserved for addenda to this Recommendation | International Standard"
        }
    },

    0b01: { name: "Application" },
    0b10: { name: "Context-specific" },
    0b11: { name: "Private" }
};


// adding parsers to some types

CLASS_TYPES[0b00][2].parser = contents => contents[0];
CLASS_TYPES[0b00][6].parser = contents => [Math.floor(contents[0] / 40), contents[0] % 40, ...contents.slice(1)];
const charStringParser = contents => String.fromCharCode(...contents);

const UNIVERSAL_TYPES = CLASS_TYPES[0b00];
Object.getOwnPropertyNames(UNIVERSAL_TYPES).forEach( type => {
    if (UNIVERSAL_TYPES[type].name == "Character string") {
        UNIVERSAL_TYPES[type].parser = charStringParser;
    };
});

exports.default = CLASS_TYPES;
