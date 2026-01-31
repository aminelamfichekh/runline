import React from 'react';

// Fixes bug with useMemo + generic types:
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
const typedMemo = React.memo;
export default typedMemo;
//# sourceMappingURL=typedMemo.js.map