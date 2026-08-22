import fs from 'fs';

// 1. Fix AdminDashboard
const file1 = 'src/components/admin/AdminDashboard.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  "import React,import { SharePointSpaConfig } from './SharePointSpaConfig.tsx'; { useState, useEffect, useMemo } from 'react';",
  "import React, { useState, useEffect, useMemo } from 'react';\nimport { SharePointSpaConfig } from './SharePointSpaConfig';"
);
fs.writeFileSync(file1, code1);

// 2. Fix sharepointService.ts backticks
const file2 = 'src/services/sharepointService.ts';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(/\\`/g, "`");
code2 = code2.replace(/\\\$/g, "$");
fs.writeFileSync(file2, code2);
