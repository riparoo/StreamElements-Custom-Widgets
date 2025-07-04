let fieldData;
let goal = 0;
let currentPoints = 0;

const storedPoints = {
    follower: 0,
    subscriber: 0,
    tip: 0,
    cheer: 0
};

window.addEventListener('onWidgetLoad', function (obj) {
    fieldData = obj.detail.fieldData;
    const sessionData = obj.detail.session?.data || {};
    goal = parseFloat(fieldData["goal"]) || 1000;

    storedPoints.follower = (sessionData["follower-goal"]?.amount || 0) * fieldData.pointsPerFollow;
    storedPoints.subscriber = (sessionData["subscriber-goal"]?.amount || 0) * fieldData.pointsPerSub;
    storedPoints.tip = (sessionData["tip-goal"]?.amount || 0) * fieldData.pointsPerTip;
    storedPoints.cheer = ((sessionData["cheer-goal"]?.amount || 0) / 100) * fieldData.pointsPerBit;

    updateTotal();
});

window.addEventListener('onEventReceived', function (obj) {
    const listener = obj.detail.listener;
    const data = obj.detail.event;

    switch (listener) {
        case 'goal':
            handleGoalEvent(data);
            break;

        case 'follower-latest':
            storedPoints.follower += fieldData.pointsPerFollow;
            break;

        case 'subscriber-latest':
            storedPoints.subscriber += fieldData.pointsPerSub;
            break;

        case 'tip-latest':
            storedPoints.tip += data.amount * fieldData.pointsPerTip;
            break;

        case 'cheer-latest':
            storedPoints.cheer += (data.amount / 100) * fieldData.pointsPerBit;
            break;

        default:
            return;
    }

    updateTotal();
});

function handleGoalEvent(data) {
    const type = data.type;
    const amount = data.amount;
    const unitPoints = getPointsPerUnit(type);

    if (unitPoints > 0) {
        storedPoints[type] = amount * unitPoints;
        updateTotal();
    }

    if (!fieldData.goal || isNaN(goal)) {
        goal = data.goal * unitPoints;
        document.getElementById('goalTotal').innerText = `${goal} Pts`;
    }
}

function getPointsPerUnit(type) {
    switch (type) {
        case 'follower': return fieldData.pointsPerFollow;
        case 'subscriber': return fieldData.pointsPerSub;
        case 'tip': return fieldData.pointsPerTip;
        case 'cheer': return fieldData.pointsPerBit / 100;
        default: return 0;
    }
}

function updateTotal() {
    currentPoints =
        storedPoints.follower +
        storedPoints.subscriber +
        storedPoints.tip +
        storedPoints.cheer;

    updateBar(currentPoints);
}

function updateBar(amount) {
    const percentage = amount / goal * 100;
    $("#bar").css('width', Math.min(100, percentage) + "%");
    $("#percent").html(parseFloat(percentage).toFixed(2));
}
