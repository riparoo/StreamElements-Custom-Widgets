let goal, fieldData;
let currentPoints;
let sessionData;

window.addEventListener('onWidgetLoad', function (obj) {
    fieldData = obj.detail.fieldData;
    goal = fieldData["goal"];
    sessionData = obj["detail"]["session"]["data"];
    analyzePoints();
});

window.addEventListener('onEventReceived', function (obj) {
	let listener = obj.detail.listener;
	let data = obj.detail.event;

	switch (listener) {
        case 'follower-latest':
            currentPoints += fieldData.pointsPerFollow;
            break;
        case 'cheer-latest':
            currentPoints += (data.amount/100) * fieldData.pointsPerBit;
            break;
        case 'tip-latest':
            currentPoints += data.amount * fieldData.pointsPerTip;
            break;
        case 'subscriber-latest':
            currentPoints += fieldData.pointsPerSub;
            break;
        default:
            break;
	}
	
	updateBar(currentPoints);
});


function analyzePoints() {
    let data = sessionData;
    let bitsAmount = data["cheer-session"]["amount"];
    let subsAmount = data["subscriber-session"]["count"];
    let tipsAmount = data["tip-session"]["amount"];
    let followerAmount = data["follower-session"]["count"];
    currentPoints = subsAmount * fieldData.pointsPerSub;
    currentPoints += tipsAmount * fieldData.pointsPerTip;
    currentPoints += (bitsAmount/100) * fieldData.pointsPerBit;
    currentPoints += followerAmount * fieldData.pointsPerFollow;
    updateBar(currentPoints);
}

function updateBar(amount) {
    let percentage = amount / goal * 100;
    $("#bar").css('width', Math.min(100, percentage) + "%");
    $("#percent").html(parseFloat(percentage).toFixed(2));
}
