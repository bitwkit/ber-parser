
// this module implements parsing of data encoded according to ASN1 Basic Encoding Rules (BER)
// numbers in parentheses refer to paragraphs of ITU-T X.690 Recommendations

const CLASS_TYPES = require('./class-types.js');

const CLASS_MASK = 0b11000000;
const CONSTRUCTED_MASK = 0b00100000;
const NUMBER_MASK = 0b00011111;
const LEADING_BIT_MASK = 0b10000000;

function readTag(buffer, startPos) {
    let pos = startPos;
    const firstByte = buffer.readUInt8(pos++);
    const tagClass = firstByte >>> 6;
    const tagConstructed = (firstByte & CONSTRUCTED_MASK) > 0;
    let tagNumber = 0;
    if ((firstByte & NUMBER_MASK) != NUMBER_MASK) {
        // non-extended (8.1.2.3)
        tagNumber = firstByte & NUMBER_MASK;
    }
    else {
        // extended (8.1.2.4)
        while (true) {
            const octet = buffer.readUInt8(pos++);
            tagNumber = tagNumber * 128 + (octet & ~LEADING_BIT_MASK);
            if ((octet & LEADING_BIT_MASK) == 0) break;
        };
    };
    const res = { class: tagClass, constructed: tagConstructed, number: tagNumber, nextPos: pos };
    return res;
};

function readLength(buffer, startPos) {
    let pos = startPos;
    const firstByte = buffer.readUInt8(pos++);
    const longForm = ((firstByte & LEADING_BIT_MASK) == 0) ? false : true;
    let contentLength = 0;
    if (!longForm) {
        // definite short form (8.1.3.4)
        contentLength = firstByte & ~LEADING_BIT_MASK;
    }
    else {
        // either definite long form (8.1.3.5) or indefinite form (8.1.3.6)
        const lengthOctets = firstByte & ~LEADING_BIT_MASK;
        while (pos <= startPos + lengthOctets) {
            contentLength = contentLength * 256 + buffer.readUInt8(pos++);
        };
    };
    const res = { indefinite: (longForm == true && contentLength == 0) ? true : false, contentLength, nextPos: pos };
    return res;
};

function readValue(buffer, startPos, tagObj, lengthObj, parseValues) {
    let res = [];
    let pos = startPos;
    if (!tagObj.constructed) {
        while (pos < startPos + lengthObj.contentLength) {
            res.push(buffer.readUInt8(pos++));
        };
        if (parseValues &&
            CLASS_TYPES[tagObj.class] &&
            CLASS_TYPES[tagObj.class].types &&
            CLASS_TYPES[tagObj.class].types[tagObj.number] &&
            CLASS_TYPES[tagObj.class].types[tagObj.number].parser) res = CLASS_TYPES[tagObj.class].types[tagObj.number].parser(res);
    }
    else {
        while (pos < startPos + lengthObj.contentLength) {
            const newObj = readTlv(buffer, pos, parseValues);
            pos = newObj.length.nextPos + newObj.length.contentLength;
            if (newObj.tag.class == 0 && newObj.tag.constructed == false && newObj.tag.number == 0 &&
                newObj.length.contentLength == 0) break; // end-of-contents contents (8.1.5)
            res.push(newObj);
        };
    };
    return res;
};

function readTlv(buffer, pos = 0, parseValues = true) {
    const tag = readTag(buffer, pos);
    const length = readLength(buffer, tag.nextPos);
    const value = readValue(buffer, length.nextPos, tag, length, parseValues);
    return { tag, length, value };
};

function showTlv(tlv, textOffset = 0) {
    console.log(
        [...Array(textOffset)].reduce( (prev, curr) => prev.concat('   '), ''), // offset spaces
        CLASS_TYPES[tlv.tag.class].name, ',', // class name
        CLASS_TYPES[tlv.tag.class] &&
        CLASS_TYPES[tlv.tag.class].types &&
        CLASS_TYPES[tlv.tag.class].types[tlv.tag.number] ? CLASS_TYPES[tlv.tag.class].types[tlv.tag.number].name : tlv.tag.number, ',', // type name if the class is universal
        (tlv.tag.constructed ?
            '[' :
            (typeof tlv.value == 'string') || tlv.length.contentLength <= 20 ?
                tlv.value :
                `[ data ${tlv.length.contentLength} bytes ]`
        )
    );
    if (tlv.tag.constructed) {
        tlv.value.forEach( elem => showTlv(elem, textOffset + 1)); // show contents with additional offset if the element is constructed
        console.log([...Array(textOffset)].reduce( (prev, curr) => prev.concat('   '), ''), ']');
    };
};

exports.readTlv = readTlv;
exports.showTlv = showTlv;
