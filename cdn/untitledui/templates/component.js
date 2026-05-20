const template = ({ imports, interfaces, componentName, props, jsx, exports }, { tpl }) => {
    const cleanComponentName = componentName.replace("Svg", "");

    return tpl`import * as React from 'react';
import type {SVGProps,FC} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
    color?: string;
    size?: number;
}

export const ${cleanComponentName}:FC<Props> = ({size=24,color='currentColor',...props}) => (
    ${jsx}
);
${cleanComponentName}.displayName = '${cleanComponentName}';`;
};

module.exports = template;
