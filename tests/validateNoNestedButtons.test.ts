import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

describe('DOM Nesting & Accessibility Validation', () => {
  test('No component with accessibilityRole="button" or HTML button contains another button in app/ or src/', () => {
    const directories = ['app', 'src'];
    const violations: string[] = [];

    function scanFile(filePath: string) {
      const code = fs.readFileSync(filePath, 'utf8');
      let ast: any;
      try {
        ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });
      } catch {
        return;
      }

      traverse(ast, {
        JSXElement(elementPath: any) {
          const opening = elementPath.node.openingElement;
          const tag = opening.name.name;

          const hasButtonRole = opening.attributes.some(
            (attr: any) =>
              attr.type === 'JSXAttribute' &&
              (attr.name.name === 'accessibilityRole' || attr.name.name === 'role') &&
              attr.value &&
              (attr.value.value === 'button' || (attr.value.expression && attr.value.expression.value === 'button'))
          );

          if (hasButtonRole) {
            elementPath.traverse({
              JSXElement(childPath: any) {
                if (childPath === elementPath) return;
                const childOpening = childPath.node.openingElement;
                const childTag = childOpening.name.name;
                const childHasButtonRole = childOpening.attributes.some(
                  (attr: any) =>
                    attr.type === 'JSXAttribute' &&
                    (attr.name.name === 'accessibilityRole' || attr.name.name === 'role') &&
                    attr.value &&
                    (attr.value.value === 'button' || (attr.value.expression && attr.value.expression.value === 'button'))
                );

                if (childHasButtonRole || childTag === 'button') {
                  violations.push(
                    `${filePath}:${opening.loc ? opening.loc.start.line : '?'} (${tag}) -> ${childTag}`
                  );
                }
              },
            });
          }
        },
      });
    }

    function walk(dir: string) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
          walk(p);
        } else if (f.endsWith('.tsx') || f.endsWith('.jsx')) {
          scanFile(p);
        }
      }
    }

    for (const d of directories) {
      walk(d);
    }

    expect(violations).toEqual([]);
  });
});

