import $ from "jquery";

export function observeQuery(selectors) {
  return new Promise((resolve, reject) => {
    try {
      const observer = new MutationObserver((mutations) => {
        mutations.some((mutation) => {
          const els = selectors.map((val) => $(val).length);
          if ((els.length == 0) | els.every((val) => val > 0)) {
            observer.disconnect();
            resolve(); // 解析 Promise
            return true;
          }
          return false;
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) {
      reject(error); // 如果出错，拒绝 Promise
    }
  });
}

export function registerBtns(buttons) {
  // 创建按钮并添加到页面
  buttons.forEach((buttonConfig, index) => {
    const button = document.createElement("button");
    button.innerText = buttonConfig.text;
    button.style.position = "fixed";
    button.style.bottom = `${20 + index * 40}px`; // 每个按钮之间的间隔
    button.style.right = "20px";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "#007bff";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.zIndex = "1000";

    // 为按钮添加过渡效果
    button.style.transition = "transform 0.1s ease";

    // 添加点击事件
    button.addEventListener("click", (event) => {
      // 调用配置的动作
      buttonConfig.action();

      // 添加点击动效
      button.style.transform = "scale(0.95)"; // 按下时缩小
      setTimeout(() => {
        button.style.transform = "scale(1)"; // 恢复原状
      }, 100); // 100ms 后恢复
    });

    // 将按钮添加到文档中
    document.body.appendChild(button);
  });
}
export function registerCommandPalette(commands) {
  // 创建命令面板的元素
  const palette = document.createElement("div");
  palette.style.position = "fixed";
  palette.style.top = "50%";
  palette.style.left = "50%";
  palette.style.transform = "translate(-50%, -50%)";
  palette.style.backgroundColor = "#ffffff";
  palette.style.border = "1px solid #ddd";
  palette.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  palette.style.zIndex = "1000";
  palette.style.padding = "20px";
  palette.style.width = "320px";
  palette.style.display = "none"; // 初始隐藏

  // 创建输入框
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type a command...";
  input.style.width = "100%";
  input.style.padding = "10px";
  input.style.marginBottom = "10px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";

  // 创建命令列表
  const commandList = document.createElement("ul");
  commandList.style.listStyleType = "none";
  commandList.style.padding = "0";
  commandList.style.margin = "0";
  commandList.style.maxHeight = "200px";
  commandList.style.overflowY = "auto";
  commandList.style.borderTop = "1px solid #eee";

  // 更新命令列表
  const updateCommandList = (searchTerm) => {
    commandList.innerHTML = ""; // 清空当前列表

    // 如果搜索框为空，显示所有命令
    const filteredCommands = searchTerm
      ? commands
          .map(command => {
            const score = fuzzyMatch(command.text, searchTerm);
            if (score !== null) {
              return { command, score };
            }
            return null; // 不匹配的命令
          })
          .filter(Boolean) // 过滤掉 null
          .sort((a, b) => a.score - b.score) // 按匹配得分排序
      : commands.map(command => ({ command }));

    // 添加匹配的命令到列表
    filteredCommands.forEach(({ command }) => {
      const listItem = document.createElement("li");
      listItem.textContent = command.text;
      listItem.style.padding = "8px";
      listItem.style.cursor = "pointer";
      listItem.style.borderBottom = "1px solid #f0f0f0";
      listItem.style.transition = "background-color 0.2s";

      // 鼠标悬停效果
      listItem.addEventListener("mouseover", () => {
        listItem.style.backgroundColor = "#f5f5f5";
      });
      listItem.addEventListener("mouseout", () => {
        listItem.style.backgroundColor = "#ffffff";
      });

      // 点击命令时执行
      listItem.addEventListener("click", () => {
        command.action();
        closePalette();
      });

      commandList.appendChild(listItem);
    });
  };

  // 简单的模糊匹配算法实现
  const fuzzyMatch = (text, searchTerm) => {
    const textLower = text.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    let searchIndex = 0;
    let score = 0;

    for (let i = 0; i < textLower.length; i++) {
      if (textLower[i] === searchTermLower[searchIndex]) {
        score += i; // 使用索引位置作为分数的一部分
        searchIndex++;
        if (searchIndex === searchTermLower.length) {
          return score; // 完全匹配，返回得分
        }
      }
    }

    return null; // 不匹配
  };

  // 输入框事件
  input.addEventListener("input", (event) => {
    updateCommandList(event.target.value);
  });

  // 回车事件
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const selectedCommand = commandList.querySelector("li:hover");
      if (selectedCommand) {
        const command = commands.find(cmd => cmd.text === selectedCommand.textContent);
        if (command) {
          command.action();
          closePalette();
        }
      }
    }
  });

  // 关闭命令面板
  const closePalette = () => {
    palette.style.display = "none";
    input.value = ""; // 清空输入框
    commandList.innerHTML = ""; // 清空命令列表
  };

  // 添加元素到命令面板
  palette.appendChild(input);
  palette.appendChild(commandList);
  document.body.appendChild(palette);

  // 显示命令面板
  const openPalette = () => {
    palette.style.display = "block";
    input.focus(); // 聚焦输入框
    updateCommandList(""); // 显示所有命令
  };

  // 绑定打开命令面板的快捷键（例如 Ctrl + Shift + P）
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "P") {
      openPalette();
    }
  });
}

// 1. 无输入的时候显示全部命令
// 2. 有最大高度，超过之后显示滚动条
// 3. 鼠标hover的时候要像组件库的list一样 并且点击的时候有反应
// 4. 改进样式，优雅美观一些不要出现覆盖