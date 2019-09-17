import typescriptPlugin from 'rollup-plugin-typescript2';
import typescript from 'typescript';
import { terser } from 'rollup-plugin-terser';

const input = './src/index.ts';

function outputFile(format) {
    return `./lib/mapper.${format}.js`;
}

function convert(format) {
    return {
        input: outputFile('esm'),
        output: {
            file: outputFile(format),
            format,
            sourcemap: true,
            name: 'mapper'
        },
    };
}

export default [
    {
        input,
        output: {
            file: outputFile('esm'),
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            typescriptPlugin({
                typescript,
                tsconfig: 'tsconfig.lib.json'
            })
        ],
    },
    convert('umd'),
    convert('cjs'),
    {
        input: outputFile('cjs'),
        output: {
            file: outputFile('cjs.min'),
            format: 'cjs'
        },
        plugins: [
            terser({
                mangle: {
                    toplevel: true,
                }
            })
        ]
    }
];
