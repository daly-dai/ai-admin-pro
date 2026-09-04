/* eslint-disable */
// 临时诊断脚本：用 exceljs 逐格 dump 样例文件原始样式（看完即删）
const path = require('path');
const fs = require('fs');
const { Workbook } = require('exceljs');

const file = process.argv[2] || path.join(__dirname, '样例.xlsx');
const buffer = fs.readFileSync(file);
const wb = new Workbook();

wb.xlsx
  .load(buffer)
  .then(() => {
    console.log('=== sheets ===');
    wb.worksheets.forEach((ws) => {
      console.log(`[sheet] name=${JSON.stringify(ws.name)} state=${ws.state} rowCount=${ws.rowCount} colCount=${ws.columnCount}`);
      const tables = (ws.model && ws.model.tables) || [];
      if (tables.length) {
        console.log(`  tables:`, JSON.stringify(tables.map((t) => ({ name: t.name, ref: t.ref, style: t.style, headerRowCount: t.headerRowCount })), null, 1));
      }
      const maxRow = Math.min(ws.rowCount, 8);
      const maxCol = Math.min(ws.columnCount, 12);
      for (let r = 1; r <= maxRow; r += 1) {
        const row = ws.getRow(r);
        for (let c = 1; c <= maxCol; c += 1) {
          const cell = row.getCell(c);
          const val = cell.value;
          let kind = 'empty';
          if (val !== null && val !== undefined) {
            if (val instanceof Date) kind = 'date';
            else if (typeof val === 'number') kind = 'number';
            else if (typeof val === 'string') kind = 'string';
            else if (typeof val === 'boolean') kind = 'bool';
            else if (val && val.richText) kind = 'richText';
            else if (val && val.formula) kind = 'formula';
            else kind = 'record';
          }
          const rec = {
            addr: cell.address,
            kind,
            text: cell.text,
            numFmt: cell.numFmt,
            styleId: cell.styleId,
            font: cell.font ? { name: cell.font.name, size: cell.font.size, bold: cell.font.bold, italic: cell.font.italic, underline: cell.font.underline, color: cell.font.color || null } : null,
            fill: cell.fill ? { type: cell.fill.type, pattern: cell.fill.pattern, fgColor: cell.fill.fgColor || null, bgColor: cell.fill.bgColor || null } : null,
            alignment: cell.alignment || null,
            border: cell.border ? {
              top: cell.border.top ? { style: cell.border.top.style, color: cell.border.top.color || null } : null,
              bottom: cell.border.bottom ? { style: cell.border.bottom.style, color: cell.border.bottom.color || null } : null,
              left: cell.border.left ? { style: cell.border.left.style, color: cell.border.left.color || null } : null,
              right: cell.border.right ? { style: cell.border.right.style, color: cell.border.right.color || null } : null,
            } : null,
          };
          const compact = JSON.stringify(rec, (k, v) => (v === undefined ? null : v));
          console.log(compact);
        }
      }
    });
    console.log('=== dxfs count ===', (wb.model && wb.model.styles && wb.model.styles.dxfs && wb.model.styles.dxfs.length) || 0);
  })
  .catch((err) => {
    console.error('LOAD FAIL', err);
    process.exit(1);
  });
