import fs from 'fs';
const file = 'src/components/admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { SharePointSpaConfig }")) {
  code = code.replace("import React,", "import React,\nimport { SharePointSpaConfig } from './SharePointSpaConfig.tsx';\n");
}

const tabButtonStr = `
          <button
            onClick={() => setActiveTab('spa_oauth')}
            id="tab-btn-spa"
            className={\`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer \${
              activeTab === 'spa_oauth'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }\`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            SPA OAuth
          </button>
`;

code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('schema'\)\}[\s\S]*?<\/button>/,
  (match) => match + tabButtonStr
);

const tabContentStr = `
        {/* TAB 5: SPA OAuth popup */}
        {activeTab === 'spa_oauth' && (
          <SharePointSpaConfig />
        )}
`;

code = code.replace(
  /\{activeTab === 'schema' && \([\s\S]*?\)\n        \}/,
  (match) => match + tabContentStr
);

fs.writeFileSync(file, code);
