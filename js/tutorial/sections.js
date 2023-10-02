function register_VIM_TUTORIAL_SECTIONS(interpreter, messager, createSection, registerSection, showCommandOneByOne, doc) {
  var G = VIM_GENERIC;

  var pressEnterToContinue = "Press enter to continue.";

  function showInfo(text) { $('.info').text(text); } //.show(); }

  function sendMessageAsync(message) { setTimeout(function() { messager.sendMessage(message); }, 0); }
  
  function requireEnterToContinue() { showCommandOneByOne(["Enter"], accepterCreator); }
  function waitPressToGotoPractice(waitCode, waitKey) {
      messager.sendMessage('waiting_for_code', { 'end': false, 'code': waitCode });
      var forAbortId = messager.listenTo('pressed_key', function (key) {
        console.log("key", key)
          if (key === waitKey) {
              window.location = 'sandbox.html';
              messager.removeListener('pressed_key', forAbortId);
          }
      });
  }

  function defaultPre() { interpreter.environment.setInsertMode(); }

  function defaultPost() {
    interpreter.environment.setCommandMode();
    showInfo(pressEnterToContinue);
    requireEnterToContinue();
  }

  /** FIXME: should reuse existing code/key functionality */
  var accepterCreator = function(command) {
    var accepter = function(key) {
      if(command === 'ctrl-v') return key === 22 || ($.browser.mozilla && key === 118); //XXX: ugly and don't even work properly
      if(command === "Esc") return key === 27;
      if(command === "Enter") return key === 13;

      var keyAsCode = G.intToChar(key);
      var neededCode = command;
      
      return keyAsCode === neededCode;
    };

    return accepter;
  };

  function cmd(code, postFun) {
      return {
        'code': code,
        'postFun': postFun
      };
    }

    /** TEMPORARY duplication */
    function writeChar(code) {
      var $ch = $(doc.getChar(code));
      $ch.insertBefore($('.cursor'));
    }

    function insertText(text, newline) {
      var mode = interpreter.environment.getMode();

      interpreter.environment.setInsertMode();
      
      newline = newline !== undefined ? newline : true;

      if(newline) {
        interpreter.interpretSequence(["Esc", "o"]);
      }

      var words = text.split(" ");

      G.for_each(words, function(word) {
        //interpreter.interpretSequence(word);
        G.for_each(word, writeChar);
        interpreter.interpretOneCommand("Space");
      });

      interpreter.environment.setMode(mode);
    }

  var introduction_section = createSection("Введение",
        defaultPre,
    [
        "Привет.",
        "Это интерактивный тренажет |Vim|.",
        "Я научу вас работать тектовым редактором. Если вы спешите, нажмите любую клавишу для перехода к следующему разделу.",
        "Чтобы попрактиковаться навыкам использования |Vim| перейдите в раздел меню |Practice|, где вы попадете в песочнцу",
        "Если вам будет непонятна логика выполнения упражнения, снова повторите его",
        "Начнем знакомство с |Vim|."
    ], defaultPost);

    var two_modes_section = createSection("Режимы, insert и normal",
        defaultPre,
    [
        "Vim имеет два основных режима. Первый |insert|, в котором вы пишете текст как в обычном текстовом редакторе.",
        "Второй |normal| режим, который предоставляет вам эффективные способы навигации и манипулирования текстом.",
        "В любой момент вы можете увидеть, в каком режиме вы находитесь, в строке состояния, расположенной вверху редактора.",
        "Для переключения между режимами используйте |Esc| для нормального режима и |i| для режима вставки.",
        "Давайте попробуем! Сначала перейдите в режим вставки."
    ],
    function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(
            [
             cmd("i", function() {
               $('.screen_view').addClass('active_context');
               insertText("Хорошо, теперь вы в режиме вставки. Напишите Esc и вернитесь в обычный режим.");
             }),
             cmd("Esc", function() {
               $('.screen_view').removeClass('active_context');
               interpreter.environment.interpretOneCommand("G");
               insertText("Хорошо. Перейдем к другому разделу.");
             }),
             "Enter"
            ],
            accepterCreator);
    }
    );

    var basic_movement = createSection("Перемещения: h, j, k, и l",
        defaultPre,
    [
        "В отличие от обычного текстового редактора, вы используете клавиши |h|, |j|, |k|, и |l| вместо клавиш со стрелками для перемещения курсора.",
        "Давайте посмотри как это работает на практике"
    ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "h", "h", "h", "h", "k", "l", "l", "l", "l", "h", "h", "h", "j", "k", "j",
          cmd("Enter", function() {
            insertText("Перейдем к следующему разделу.");
          }), "Enter"],
          accepterCreator);
    });

    var word_movement = createSection("Перемещение по словам: w, e, b",
        defaultPre,
      [
        "Для навигации по тексту по словам можно использовать клавиши |w|, |b|, и |e| (также W, B, E в реальном Vim).",
        "клавиша |w| - переходит к началу следующего слова; |e| - перемещение к концу слова и |b| - перемещение в начало слова."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fn"); // cursor to "begin[n]ing"
        showCommandOneByOne([
          "b", "e", "b", "w", "e", "w", "e", "b",
          cmd("Enter", function() {
            insertText("Двигаемся дальше.");
          }), "Enter"],
          accepterCreator);
    });

    var times_movement = createSection("Перемещение с цифрами. 5w",
      defaultPre,
      [
          "Перемещение по тексту не ограничивается отдельными клавишами; вы можете комбинировать клавиши перемещения с |цифрами|. Например, |3w| это то же самое, что нажать три раза w."
          
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("0");
        showCommandOneByOne(["3", "w", "9", "l", "2", "b",
            cmd("Enter", function() { insertText("Нажмите Enter для перехода к следующему разделу.") }),
            "Enter"
        ],
        accepterCreator)
      });

    var times_inserting = createSection("Повторное добавление тескта, например 3iYes",
        defaultPre,
        [
            "Для примера фразу go повторим 3 раза, в номальном режиме введем комаду |3i|, после этого мы перейдем в интерактивный режим и после ввода и нажатия клавиши |Esc|, текст продублируется",
            "------------------------------",
            "В интерактивном режиме вы можете установить пробелы между словами, перейти на строку ниже для копирования слов по вертикали "
        ],
        function() {
            interpreter.environment.setCommandMode();
            showCommandOneByOne(
                ["3", "i", "g", "o", "Esc",
                cmdWithText("Enter", "Попробуйте на реальном Vim выполнить 10i"),
                "Enter"
                ], accepterCreator)
        });

    var find_occurrence = createSection("Поиск в строке, f и F",
        defaultPre,
        [
            "Для того чтобы найти и перейти к следующему (или предыдущему) вхождению символа, используйте |f| and |F|, для поиска следующего вхождения буквы o используем команду|fo| ",
            "Возможно комбинирование с цифрами. В примере найдем w и третье вхождение буквы q",
            "You can combine f with a number. For example, you can find 3rd occurrence of 'q' with |3fq|, que?"
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence("0");
          showCommandOneByOne(["f", "w", "f", "s", "3", "f", "q",
              cmd("Enter", function() { insertText("F-f-f-ast!") }),
              "Enter"
          ], accepterCreator)
        });

    var matching_parentheses = createSection("Переход к совпадающим скобкам, %",
      defaultPre,
      [
        "В тексте мы можем перепрыгивать между используя |(|, |{| или |[|, используя |%|.",
        "Это простой ( пример перехода между зависимыми скобками). ПРОБУЙТЕ"
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence(["F", "("]);
        showCommandOneByOne(["%", "%", "Enter"], accepterCreator)
      });

    var start_and_end_of_line = createSection("Переход к началу и концу строки, 0 и $",
      defaultPre,
      [
        "Чтобы перейти к началу строки, нажмите |0|.",
        "Для перехода к концу строки |$|"
      ],
      function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(["0", "$", "0", "Enter"], accepterCreator)
      });

    var word_under_cursor = createSection("Поиск слова под курсором, * and #",
      defaultPre,
        [
        "Найдите следующее вхождение слова под курсором с помощью |*|, и предыдущее с помощью |#|.",
         "Find the next occurrence of the word under cursor with |*|, and the previous with |#|."
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence(["0", "w"]);
          showCommandOneByOne(["*", "*", "#",
              cmd("#", function() {
                insertText("")
              }), "Enter"], accepterCreator)
        });

    var goto_line = createSection("Переход между строками, g и G",
        defaultPre,
        [
         "|gg| перенесет курсор в начало файла, а |G| в конец.",
         "Чтобы перейти непосредственно к определенной строке, укажите ее |номкр| вместе с |G|.",
         "Давайте перейдем в начало экрана с помощью |gg| и вернемся в конец |G|."
        ],
        function() {
          interpreter.environment.setCommandMode();
          showCommandOneByOne(["g", "g", "G",
             cmd("Enter", function() {
                 insertText("Перейдем на вторую строку при помощи команды 2G.");
             }),
             "2", "G",
             cmd("Enter", function() {
                insertText("gg! ")
             }), "Enter"
          ], accepterCreator)
        });

    var search_match = createSection("Поиск слов ни примере, /text с n и N",
      defaultPre,
      [
        "Поиск текста — жизненно важная часть любого текстового редактора. В Vim вы нажимаете |/|, и вводите искомый текст.",
        "Для прохода по следующим или предыдущим вхождениям слова используйте |n| and |N|", 
        "Для более продвинутого поиска используйте регулярные выражения текстового редактора Vim",
        "Попробуйте найти вхождение слова (text)",
        "Searching text is a vital part of any text editor. In Vim, you press |/|, and give the text you are looking for.",
        "You can repeat the search for next and previous occurrences with |n| and |N|, respectively.",
        "For advanced use cases, it's possible to use regexps that help to find text of particular form (In real Vim).",

      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("1G");
        showCommandOneByOne(
          ["/", "t", "e", "x", "t", "Enter", "n", "n", "N", "N",
          cmd("Enter",
            function() {
              interpreter.interpretSequence(["/", "Esc"]);
              insertText("");
            }),
          "Enter"], accepterCreator
        )
      });

    var removing = createSection("Удаление символов, x м X",
        defaultPre,
      [
      "Удалим символ под курсором при помощи команды |x|, для удаления символа перед курсором используем |X| "
    
      ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "x", "x", "x", "x", "x",
          cmd("x", function() {
             insertText("Sometimes the treasure is the indicator (x).");
          }),
            
          "X", "X", "X", "X", "X",
          cmd("X", function() {
            //insertText("You removed yourself from this section. Next!");
          }),
          
          "Enter"],
          accepterCreator);
    });

    var replacing = createSection("Замена буквы под курсором, r",
        defaultPre,
      [
      "Если вам нужно заменить только один символ под курсором, не переходя в режим вставки, используйте |r|."
      
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fy");
        showCommandOneByOne([
          "r", "e", "Enter"],
          accepterCreator);
    });

    function cmdWithText(command, text) {
        return cmd(command, function() {
                 insertText(text);
               });
    }

    function setActiveContext() { $('.screen_view').addClass('active_context'); }
    function unsetActiveContext() { $('.screen_view').removeClass('active_context'); }

    var adding_line = createSection("Вставка новой строки, o и O",
      defaultPre,
        [
            "Чтобы вставить новую строку ниже курсора, используйте команду |o| или ниже курсора |O|",
            "После создания новой строки редактор устанавливается режим |insert|.",
            "После редактирования текста вернитесь в |normal| режим."
        ], function() {
            interpreter.environment.setCommandMode();
            interpreter.interpretSequence(["2", "G"]);
            showCommandOneByOne([
                cmd("o", function() {
                    setActiveContext();
                }),
                cmd("Esc", function() {
                    unsetActiveContext();
                    insertText("Теперь большую букву O, чтобы вставить новую строку над текущей строкой.");
                    interpreter.environment.setCommandMode();
                }),
                cmd("O", setActiveContext),
                cmd("Esc",
                    function() {
                        insertText("Ты на пути успеха O___o");
                        unsetActiveContext();
                    }), "Enter"
            ], accepterCreator)
        });

    var deleting = createSection("Удаление, d",
        defaultPre,
      [
      "|d| команда удаления",
      "Вы можете комбинировать команду удаления |d|, с командой |w| для удаления одного слова, как |dw|, также вы можете уточнять количество слов",
      "Команда также копирует содержимое, так что вы можете вставить в другое место, используя команду |p| (на реальном Vim)."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.environment.interpretOneCommand("0");
        showCommandOneByOne([
          "d", "w",
          cmd("Enter", function() {
            insertText("Слово пропало. Теперь давайте удалим два слова с помощью d2e.");
            interpreter.environment.interpretSequence(["0"]);
          }),
          "d", "2", "e",
          cmd("Enter", function() {
            insertText("Более подробная информация о списках команд и их отличиях, будет представлена в песочнице ");
          }), "Enter"],
          accepterCreator);
    });

  var repetition = createSection("Повторение с .",
    defaultPre,
    [
        "Для повторения предыдуще команды нажмите |.|",
        "Удалим два слова командой |d2w|.",
        "После этого удалите остальные слова в этой строке с помощью |.|"
    ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretOneCommand("0");
        showCommandOneByOne([
            "d", "2",
            "w", ".", ".", ".", ".", ".",
          cmd("Enter", function() {
            insertText("")
          }),
            "Enter"
        ], accepterCreator)
      });

  var visual_mode = createSection("Визуадбный режим, v",
    defaultPre,
    [
      "Помимо режима insert и normal в Vim есть также |visual| режим.",
      "В визуальном режиме вы выделяете текст с помощью клавиш перемещения и управляете им к примеру для оперции удаления.",
      "Для перехода в визуальный режим нажмем клавишу |v|. Затем выберите слово с помощью |e|. После выделения текста удалим при помощи клавиши |d|.",
      "This sentence has not seen the light."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("4b");
      showCommandOneByOne(
        ["v", "e", "l", "d",
          cmdWithText("Enter", "(Прекрасно)"), "Enter"
        ], accepterCreator)
    });

  var visual_block_mode = createSection("Visual block mode, ctrl-v",
    defaultPre,
    [
      "There is yet another mode: |visual block|. This makes it possible to insert text on many lines at once. Let's see how with an example list.",
      "<> A smart girl",
      "<> Ulysses",
      "<> Learn and teach",
      "First, move cursor to insert position. Then press |ctrl-v| to go into visual block mode. Move cursor vertically to select lines. Now press |I|, and prepend text to the selected area. |Esc| completes the insertion."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("2G");
      showCommandOneByOne(["l", "ctrl-v", "j", "j", "I", "o", "Esc",
        cmdWithText("Enter", "Blocks are obstacles for making progress."), "Enter"],
        accepterCreator);
    });

  var last_commands = createSection("Переход к реальному Vim",
        defaultPre,
    [
        "Теперь вы с уверенностью можете работать с Vim.",
        "Вaжно уметь корректно работать с выходом из документ |:w| (сохранить), |:q| (выйти), and |:q!| (выйти без сохраниения).",
        "Полее подробная информация о правилах завершения работы с файлом приведена в официальной документаци |:help|",
        "Для перехода в режим выхода используйте комбинацию клавиш Shift + :"
    ],
        defaultPost
    );

  var the_end = createSection("Конец", defaultPre,
      [
        "Спасибо!!! Вы научились работать с текстовым редактором VIM ",
        "Нажмите |space| если вы хотите в произвольной форме протестировать команды в песочнице.",
        "Пока"
      ], () => waitPressToGotoPractice('Space', 32));

  var tests = createSection("Тестовая страница", defaultPre,
      [
        "Спасибо!!! Вы научились работать с текстовым редактором VIM ",
        "Нажмите |space| если вы хотите в произвольной форме протестировать команды в песочнице.",
        "Пока"
      ], () => waitPressToGotoPractice('Space', 32));

  // append a and A
  // J join lines

  /**********************************************
   * Later
   **********************************************/

  // undo
  // change inside parentheses
  // macro

  /**********************************************
   * Register sections
   **********************************************/

    registerSections([
      introduction_section,
      two_modes_section,
      basic_movement,
      word_movement,
      times_movement,
      times_inserting,
      find_occurrence,
      matching_parentheses,
      start_and_end_of_line,
      word_under_cursor,
      goto_line,
      search_match,
      adding_line,
      removing,
      replacing,
      deleting,
      repetition,
      visual_mode,
      //visual_block_mode, // TODO enable when ctrl-v works with most browsers
      last_commands,
      the_end,
      tests
    ]);

  function registerSections(sections) {
    G.for_each(sections, function(section) {
      registerSection(section);
    });
  }
}
