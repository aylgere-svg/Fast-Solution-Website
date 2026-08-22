import fs from 'fs';
const file = 'src/components/admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import React,import { SharePointSpaConfig } from './SharePointSpaConfig.tsx'; { useState, useEffect, useMemo } from 'react';",
  "import React, { useState, useEffect, useMemo } from 'react';\nimport { SharePointSpaConfig } from './SharePointSpaConfig';\n"
);
fs.writeFileSync(file, code);
