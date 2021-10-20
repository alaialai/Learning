/*
 * @Author: xiangly
 * @Date: 2020-10-19 16:27:22
 * @LastEditors: xiangly
 * @LastEditTime: 2020-11-13 13:49:03
 * @Description: 导出有样式的excel
 */
import XLSX from 'xlsx';
import XLSXStyle from 'xlsx-style';
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
}
function saveAs(obj, fileName) {
    var tmpa = document.createElement("a");
    tmpa.download = fileName || "下载";
    tmpa.href = URL.createObjectURL(obj);
    tmpa.click();
    setTimeout(function() {
        URL.revokeObjectURL(obj);
    }, 100);
}
// 数据整合成sheet，使用xlxs
function normalizeSheet({
    title= 'title',
    code= 'code',
    logo= 'lodo',
    tableHeader= 'coloum',
    tableData= []
}) {
    let header = tableHeader.reduce((acc,cur) => {
        return  acc.concat([cur.title])
     },[])
     let len = header.length
     let tableInfoOne = new Array(len).fill(null);
     let tableInfoTwo =new Array(len).fill(null);
     tableInfoOne[0] = title
     tableInfoTwo[0] = logo;
     tableInfoTwo[len-1] = code;
     console.log( XLSX.utils)
     let sheet = XLSX.utils.aoa_to_sheet([tableInfoOne,tableInfoTwo,header])
     XLSX.utils.sheet_add_json(sheet, tableData,  {skipHeader: true, origin: "A4"});
     XLSX.utils.sheet_add_json(sheet, tableData,  {skipHeader: true, origin: "A4"});
     sheet['!merges'] = [
         // 设置A1-C1的单元格合并
         {s: {r: 0, c: 0}, e: {r: 0, c: len-1}}
     ];
     return sheet
}
// 为sheet添加style，使用xlsx-style
function sheetAddStyle(sheetData,filename){
    let sheet = Object.assign({},sheetData)
    let wb = {
        SheetNames: [],
        Sheets: {}
    };
    wb.SheetNames.push(filename);
    wb.Sheets[filename] = sheet;
    var dataInfo = wb.Sheets[wb.SheetNames[0]];
    console.log(dataInfo['!ref'].split(':'))
    // let start = dataInfo['!ref'].split(':')[0]
    let end = dataInfo['!ref'].split(':')[1]
    // let colLastNum = end.replace(/[^\d.]/g, '');
    let colLastEng =  end.replace(/[^a-zA-Z]/g, '')
    // console.log(colLastNum,colLastEng)
    // 标题样式
    dataInfo["A1"].s = {
        font: {
            name: "宋体",
            sz: 18,
            color: { rgb: "000000" },
            bold: false,
            italic: false,
            underline: false
        },
        alignment: {
            horizontal: "center",
            vertical: "center"
        }
    };
    for (let key in dataInfo) {

        if(key == `${colLastEng}2`){
            // code样式
            dataInfo[key].s = {
                font: {
                    name: "宋体",
                    sz: 12,
                    color: { rgb: "000000" },
                    bold: false,
                    italic: false,
                    underline: false
                },
                alignment: {
                    horizontal: "right",
                    vertical: "center"
                }
            }
        }else if(key.replace(/[^\d.]/g, '') ==3){
            // 表格表头样式
            dataInfo[key].s = {
                font: {
                    name: "宋体",
                    sz: 12,
                    color: { rgb: "000000" },
                    bold: false,
                    italic: false,
                    underline: false
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                }
            }
        }else if(key.replace(/[^\d.]/g, '') >3 && key.replace(/[^a-zA-Z]/g, '') !== 'A'){
            // 表格内数据
            dataInfo[key].s = {
                font: {
                    name: "宋体",
                    sz: 12,
                    color: { rgb: "000000" },
                    bold: false,
                    italic: false,
                    underline: false
                },
                alignment: {
                    horizontal: "right",
                    vertical: "center"
                }
            }
        }

    }
    return wb
}

export function toExcel({
    filename='filename',
    title= 'title',
    code= 'code',
    logo= 'lodo',
    tableHeader= 'coloum',
    tableData= []
}) {
    let sheet = normalizeSheet({
        title,
        code,
        logo,
        tableHeader,
        tableData
    })
    let wb = sheetAddStyle(sheet,filename)
    let wbout = XLSXStyle.write(wb, {
        bookType: "xlsx",
        bookSST: false,
        type: "binary"
    });

    saveAs(
        new Blob([s2ab(wbout)], {
            type: "application/octet-stream"
        }),
        `${filename}.xlsx`
    );

}
