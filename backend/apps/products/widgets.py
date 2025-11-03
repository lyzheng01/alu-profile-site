from django import forms
from django.utils.safestring import mark_safe
import json

class ExcelTableWidget(forms.Widget):
    """Excel风格的表格widget"""
    
    def __init__(self, attrs=None):
        super().__init__(attrs)
        self.attrs = attrs or {}

    def render(self, name, value, attrs=None, renderer=None):
        """渲染Excel风格表格"""
        if value is None:
            value = []
        elif isinstance(value, str):
            try:
                parsed = json.loads(value) if value else []
                if isinstance(parsed, list):
                    value = parsed
                else:
                    value = [parsed] if parsed else []
            except json.JSONDecodeError:
                if value.strip():
                    value = [{"规格": value}]
                else:
                    value = []

        if not isinstance(value, list):
            value = []

        # 生成Excel风格的HTML
        html = f'''
        <div id="excel-table-{name}" class="excel-table-widget" style="font-family: Arial, sans-serif;">
            <style>
                .excel-table {{
                    border-collapse: collapse;
                    width: 100%;
                    font-size: 14px;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .excel-table th {{
                    background: #4472C4;
                    color: white;
                    font-weight: bold;
                    text-align: center;
                    padding: 10px 8px;
                    border: 1px solid #8EAADB;
                    font-size: 13px;
                }}
                .excel-table td {{
                    border: 1px solid #D9D9D9;
                    padding: 0;
                    background: white;
                    vertical-align: middle;
                }}
                .excel-table input {{
                    width: 100%;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 14px;
                    padding: 8px;
                    box-sizing: border-box;
                }}
                .excel-table input:focus {{
                    background: #E7F3FF;
                    box-shadow: inset 0 0 0 2px #4472C4;
                }}
                .excel-controls {{
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #F8F9FA;
                    border-radius: 4px;
                }}
                .excel-btn {{
                    background: #4472C4;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin-right: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                }}
                .excel-btn:hover {{
                    background: #365F91;
                }}
                .excel-btn-danger {{
                    background: #C5504B;
                    padding: 4px 8px;
                    font-size: 11px;
                }}
                .excel-btn-danger:hover {{
                    background: #A0413D;
                }}
                .excel-hint {{
                    margin-left: 20px;
                    color: #666;
                    font-size: 12px;
                    font-style: italic;
                }}
            </style>
            
            <div class="excel-controls">
                <button type="button" class="excel-btn add-row-btn">+ 添加行</button>
                <span class="excel-hint">
                    提示：点击单元格编辑，按Tab键移动到下一个单元格，支持键盘导航
                </span>
            </div>
            
            <table class="excel-table" id="table-{name}">
                <thead>
                    <tr id="header-row-{name}">
                        <th style="width: 200px;">规格名称</th>
                        <th style="width: 300px;">规格值</th>
                        <th style="width: 100px;">操作</th>
                    </tr>
                </thead>
                <tbody id="table-body-{name}">
        '''

        # 添加现有数据行
        for i, row in enumerate(value):
            html += self._render_excel_row(name, i, row)

        html += f'''
                </tbody>
            </table>
            <input type="hidden" name="{name}" id="hidden-input-{name}" value='{json.dumps(value).replace("'", "&#39;")}'>
        </div>

        <script>
        (function() {{
            const tableId = 'table-{name}';
            const widgetDiv = document.getElementById('excel-table-{name}');
            const addRowBtn = widgetDiv.querySelector('.add-row-btn');
            const tableBody = widgetDiv.querySelector('#table-body-{name}');
            const hiddenInput = widgetDiv.querySelector('#hidden-input-{name}');

            // 初始化
            updateHiddenInput();

            // 事件绑定
            addRowBtn.addEventListener('click', addRow);

            // 绑定现有行的事件
            bindRowEvents();

            function addRow() {{
                const rowHtml = `
                    <tr>
                        <td><input type="text" class="spec-name" placeholder="如：长度" style="width: 100%; border: none; outline: none; background: transparent; padding: 8px;"></td>
                        <td><input type="text" class="spec-value" placeholder="如：1000mm" style="width: 100%; border: none; outline: none; background: transparent; padding: 8px;"></td>
                        <td style="text-align: center;">
                            <button type="button" class="excel-btn excel-btn-danger remove-row-btn">删除</button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', rowHtml);
                
                // 绑定新行的事件
                const newRow = tableBody.lastElementChild;
                bindRowEvents(newRow);
                updateHiddenInput();
                
                // 自动聚焦到新行的第一个输入框
                newRow.querySelector('input.spec-name').focus();
            }}

            function bindRowEvents(row = null) {{
                const rows = row ? [row] : tableBody.querySelectorAll('tr');
                
                rows.forEach(row => {{
                    // 删除按钮
                    const removeBtn = row.querySelector('.remove-row-btn');
                    if (removeBtn) {{
                        removeBtn.addEventListener('click', function() {{
                            row.remove();
                            updateHiddenInput();
                        }});
                    }}
                    
                    // 输入框事件
                    const inputs = row.querySelectorAll('input');
                    inputs.forEach(input => {{
                        input.addEventListener('input', updateHiddenInput);
                        input.addEventListener('keydown', function(e) {{
                            if (e.key === 'Tab') {{
                                e.preventDefault();
                                const nextInput = this.parentElement.nextElementSibling?.querySelector('input');
                                if (nextInput) {{
                                    nextInput.focus();
                                }} else {{
                                    // 如果当前行没有下一个输入框，移动到下一行的第一个输入框
                                    const nextRow = this.closest('tr').nextElementSibling;
                                    if (nextRow) {{
                                        const firstInput = nextRow.querySelector('input');
                                        if (firstInput) firstInput.focus();
                                    }}
                                }}
                            }}
                            if (e.key === 'Enter') {{
                                e.preventDefault();
                                const nextInput = this.parentElement.nextElementSibling?.querySelector('input');
                                if (nextInput) {{
                                    nextInput.focus();
                                }}
                            }}
                        }});
                        input.addEventListener('focus', function() {{
                            this.style.background = '#E7F3FF';
                            this.style.boxShadow = 'inset 0 0 0 2px #4472C4';
                        }});
                        input.addEventListener('blur', function() {{
                            this.style.background = 'transparent';
                            this.style.boxShadow = 'none';
                        }});
                    }});
                }});
            }}

            function updateHiddenInput() {{
                const rows = tableBody.querySelectorAll('tr');
                const data = [];

                rows.forEach(row => {{
                    const specNameInput = row.querySelector('input.spec-name');
                    const specValueInput = row.querySelector('input.spec-value');

                    if (specNameInput && specValueInput) {{
                        const specName = specNameInput.value.trim();
                        const specValue = specValueInput.value.trim();

                        if (specName && specValue) {{
                            data.push({{[specName]: specValue}});
                        }}
                    }}
                }});

                hiddenInput.value = JSON.stringify(data);
                console.log('Excel表格数据已更新:', hiddenInput.value);
            }}

        }})();
        </script>
        '''

        return mark_safe(html)

    def _render_excel_row(self, name, index, row_data):
        """渲染Excel风格的单行数据"""
        if isinstance(row_data, dict) and len(row_data) == 1:
            key, value = list(row_data.items())[0]
            key_escaped = str(key).replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
            value_escaped = str(value).replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
            return f'''
            <tr>
                <td><input type="text" class="spec-name" value="{key_escaped}" placeholder="规格名称" style="width: 100%; border: none; outline: none; background: transparent; padding: 8px;"></td>
                <td><input type="text" class="spec-value" value="{value_escaped}" placeholder="规格值" style="width: 100%; border: none; outline: none; background: transparent; padding: 8px;"></td>
                <td style="text-align: center;">
                    <button type="button" class="excel-btn excel-btn-danger remove-row-btn">删除</button>
                </td>
            </tr>
            '''
        else:
            row_data_escaped = str(row_data).replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
            return f'''
            <tr>
                <td><input type="text" class="spec-name" value="规格名称" placeholder="规格名称" style="width: 100%; border: none; outline: none; background: transparent; padding: 8px;"></td>
                <td><input type="text" class="spec-value" value="{row_data_escaped}" placeholder="规格值" style="width: 100%; border: none; outline: none; background: transparent; padding: 8px;"></td>
                <td style="text-align: center;">
                    <button type="button" class="excel-btn excel-btn-danger remove-row-btn">删除</button>
                </td>
            </tr>
            '''

    def value_from_datadict(self, data, files, name):
        """从表单数据中获取值"""
        value = data.get(name)
        if value:
            return value
        return ''