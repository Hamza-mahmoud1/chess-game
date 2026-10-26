// تهيئة متغيرات اللعبة والمكتبات
var board = null;
var game = new Chess();
var $status = $('#status');

// 1. دالة تنفذ عند بدء محاولة سحب أي قطعة
function onDragStart (source, piece, position, orientation) {
    // لا تسمح بسحب القطع إذا كانت اللعبة قد انتهت بالفعل
    if (game.game_over()) return false;

    // منع اللاعب من تحريك قطع الروبوت (القطع التي تبدأ بحرف b تعني black/أسود)
    if (piece.search(/^b/) !== -1) return false;
}

// 2. دالة حركة الروبوت (الذكاء الاصطناعي البسيط)
function makeRobotMove () {
    var possibleMoves = game.moves();

    // إذا لم يعد هناك حركات متاحة للروبوت، تتوقف الدالة
    if (possibleMoves.length === 0) return;

    // يقوم الروبوت باختيار حركة عشوائية ذكية من الحركات القانونية المتاحة أمامه
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIdx]);
    
    // تحديث شكل اللوحة على الشاشة وحالة الدور
    board.position(game.fen());
    updateStatus();
}

// 3. دالة تنفذ عند إفلات القطعة في مربع جديد (محاولة اللعب)
function onDrop (source, target) {
    // التحقق برمجياً مما إذا كانت الحركة قانونية وفقاً لقواعد الشطرنج
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // ترقية تلقائية للوزير/الملكة عند وصول العسكري لنهاية اللوحة
    });

    // إذا كانت الحركة غير قانونية، قم بإعادة القطعة لمكانها الأصلي فوراً
    if (move === null) return 'snapback';

    // تحديث نص الحالة إلى دور الروبوت
    updateStatus();

    // جعل الروبوت يفكر ويلعب بعد 250 مللي ثانية من حركة اللاعب البشري
    window.setTimeout(makeRobotMove, 250);
}

// 4. دالة لتحديث المواقع بشكل مرئي بعد انتهاء السحب والإفلات
function onSnapEnd () {
    board.position(game.fen());
}

// 5. دالة تحديث شريط الحالة للتحقق من الفوز، الخسارة، أو كش ملك
function updateStatus () {
    var status = '';
    var moveColor = 'الأبيض';
    
    if (game.turn() === 'b') {
        moveColor = 'الأسود (الروبوت)';
    }

    // التحقق من كش ملك (نهاية اللعبة بفوز أحد الطرفين)
    if (game.in_checkmate()) {
        status = 'انتهت اللعبة! خسارة اللون ' + moveColor + ' بسبب كش ملك.';
    }
    // التحقق من حالات التعادل المختلفة
    else if (game.in_draw()) {
        status = 'انتهت اللعبة! النتيجة هي التعادل.';
    }
    // إذا كانت اللعبة مستمرة بشكل طبيعي
    else {
        status = 'دور اللاعب: ' + moveColor;
        // تنبيه اللاعب إذا كان في وضعية "كش"
        if (game.in_check()) {
            status += ' (انتبه، ملكك في خطر كش!)';
        }
    }

    // عرض النص في واجهة المستخدم
    $status.html(status);
}

// 6. إعدادات تشغيل لوحة الشطرنج الرسومية
var config = {
    draggable: true, // السماح بسحب القطع
    position: 'start', // بدء اللعبة من الوضعية القياسية المعتادة
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    // جلب صور قطع الشطرنج الكلاسيكية عبر الإنترنت
    pieceTheme: 'https://chessboardjs.com{piece}.png'
};

// تشغيل اللوحة وربطها بـ الـ div الموجود في HTML
board = Chessboard('myBoard', config);
updateStatus();

// 7. برمجة زر إعادة التشغيل عند الضغط عليه
$('#restartBtn').on('click', function() {
    game.reset(); // إعادة تعيين القواعد
    board.start(); // إعادة القطع لأماكنها الأصلية
    updateStatus(); // إعادة تصفير شريط الحالة
});
