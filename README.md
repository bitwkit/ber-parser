# ber-parser
A simple ASN1 BER parser

## purpose
This module implements parsing of data encoded according to ASN1 Basic Encoding Rules (BER) of ITU-T X.690 Recommendations.

## usage
All the processing is done within one function: readTlv(buffer: Buffer, pos: number, parseValues?: boolean)
buffer - actual data to parse
pos - start position in the buffer
parseValue - indicates whether the individual type-dependant parsers should be applied to values (they are declared in a CLASS_TYPES object for some common types)

You can print out to console the contents of the resulting object with an additional function showTlv(tlv).

### example
```javascript
const {readTlv, showTlv} = require('ber-parser');
showTlv(readTlv(someBuffer, 0, true));
```
