import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace crx_file. */
export namespace crx_file {

    /** Properties of a CrxFileHeader. */
    interface ICrxFileHeader {

        /** CrxFileHeader sha256WithRsa */
        sha256WithRsa?: (crx_file.IAsymmetricKeyProof[]|null);

        /** CrxFileHeader sha256WithEcdsa */
        sha256WithEcdsa?: (crx_file.IAsymmetricKeyProof[]|null);

        /** CrxFileHeader verifiedContents */
        verifiedContents?: (Uint8Array|null);

        /** CrxFileHeader signedHeaderData */
        signedHeaderData?: (Uint8Array|null);
    }

    /** Represents a CrxFileHeader. */
    class CrxFileHeader implements ICrxFileHeader {

        /**
         * Constructs a new CrxFileHeader.
         * @param [properties] Properties to set
         */
        constructor(properties?: crx_file.ICrxFileHeader);

        /** CrxFileHeader sha256WithRsa. */
        public sha256WithRsa: crx_file.IAsymmetricKeyProof[];

        /** CrxFileHeader sha256WithEcdsa. */
        public sha256WithEcdsa: crx_file.IAsymmetricKeyProof[];

        /** CrxFileHeader verifiedContents. */
        public verifiedContents: Uint8Array;

        /** CrxFileHeader signedHeaderData. */
        public signedHeaderData: Uint8Array;

        /**
         * Creates a new CrxFileHeader instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CrxFileHeader instance
         */
        public static create(properties?: crx_file.ICrxFileHeader): crx_file.CrxFileHeader;

        /**
         * Encodes the specified CrxFileHeader message. Does not implicitly {@link crx_file.CrxFileHeader.verify|verify} messages.
         * @param message CrxFileHeader message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: crx_file.ICrxFileHeader, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CrxFileHeader message, length delimited. Does not implicitly {@link crx_file.CrxFileHeader.verify|verify} messages.
         * @param message CrxFileHeader message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: crx_file.ICrxFileHeader, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CrxFileHeader message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CrxFileHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): crx_file.CrxFileHeader;

        /**
         * Decodes a CrxFileHeader message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CrxFileHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): crx_file.CrxFileHeader;

        /**
         * Verifies a CrxFileHeader message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CrxFileHeader message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CrxFileHeader
         */
        public static fromObject(object: { [k: string]: any }): crx_file.CrxFileHeader;

        /**
         * Creates a plain object from a CrxFileHeader message. Also converts values to other types if specified.
         * @param message CrxFileHeader
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: crx_file.CrxFileHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CrxFileHeader to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CrxFileHeader
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AsymmetricKeyProof. */
    interface IAsymmetricKeyProof {

        /** AsymmetricKeyProof publicKey */
        publicKey?: (Uint8Array|null);

        /** AsymmetricKeyProof signature */
        signature?: (Uint8Array|null);
    }

    /** Represents an AsymmetricKeyProof. */
    class AsymmetricKeyProof implements IAsymmetricKeyProof {

        /**
         * Constructs a new AsymmetricKeyProof.
         * @param [properties] Properties to set
         */
        constructor(properties?: crx_file.IAsymmetricKeyProof);

        /** AsymmetricKeyProof publicKey. */
        public publicKey: Uint8Array;

        /** AsymmetricKeyProof signature. */
        public signature: Uint8Array;

        /**
         * Creates a new AsymmetricKeyProof instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AsymmetricKeyProof instance
         */
        public static create(properties?: crx_file.IAsymmetricKeyProof): crx_file.AsymmetricKeyProof;

        /**
         * Encodes the specified AsymmetricKeyProof message. Does not implicitly {@link crx_file.AsymmetricKeyProof.verify|verify} messages.
         * @param message AsymmetricKeyProof message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: crx_file.IAsymmetricKeyProof, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AsymmetricKeyProof message, length delimited. Does not implicitly {@link crx_file.AsymmetricKeyProof.verify|verify} messages.
         * @param message AsymmetricKeyProof message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: crx_file.IAsymmetricKeyProof, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AsymmetricKeyProof message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns AsymmetricKeyProof
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): crx_file.AsymmetricKeyProof;

        /**
         * Decodes an AsymmetricKeyProof message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns AsymmetricKeyProof
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): crx_file.AsymmetricKeyProof;

        /**
         * Verifies an AsymmetricKeyProof message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AsymmetricKeyProof message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AsymmetricKeyProof
         */
        public static fromObject(object: { [k: string]: any }): crx_file.AsymmetricKeyProof;

        /**
         * Creates a plain object from an AsymmetricKeyProof message. Also converts values to other types if specified.
         * @param message AsymmetricKeyProof
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: crx_file.AsymmetricKeyProof, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AsymmetricKeyProof to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for AsymmetricKeyProof
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SignedData. */
    interface ISignedData {

        /** SignedData crxId */
        crxId?: (Uint8Array|null);
    }

    /** Represents a SignedData. */
    class SignedData implements ISignedData {

        /**
         * Constructs a new SignedData.
         * @param [properties] Properties to set
         */
        constructor(properties?: crx_file.ISignedData);

        /** SignedData crxId. */
        public crxId: Uint8Array;

        /**
         * Creates a new SignedData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignedData instance
         */
        public static create(properties?: crx_file.ISignedData): crx_file.SignedData;

        /**
         * Encodes the specified SignedData message. Does not implicitly {@link crx_file.SignedData.verify|verify} messages.
         * @param message SignedData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: crx_file.ISignedData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SignedData message, length delimited. Does not implicitly {@link crx_file.SignedData.verify|verify} messages.
         * @param message SignedData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: crx_file.ISignedData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignedData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SignedData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): crx_file.SignedData;

        /**
         * Decodes a SignedData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SignedData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): crx_file.SignedData;

        /**
         * Verifies a SignedData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SignedData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SignedData
         */
        public static fromObject(object: { [k: string]: any }): crx_file.SignedData;

        /**
         * Creates a plain object from a SignedData message. Also converts values to other types if specified.
         * @param message SignedData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: crx_file.SignedData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SignedData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SignedData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
