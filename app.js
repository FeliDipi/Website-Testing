const play = document.querySelector("#btn-play");
const add = document.querySelector("#btn-add");

play.addEventListener("click",()=>
{
  console.log("play simulation");
  var event=
  {
      key:"SimulationControllerMessage",
      data:"play"
  }
  var eventStr = JSON.stringify(event);
  unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call play simulation method in Unity
})

add.addEventListener("click",()=>
{
  console.log("add task");
  var event=
  {
      key:"SimulationMessage",
      data:
      [
          {
              id:"O0083",
              state:"inprogress",
              message:"Wiping",
              description:"In Progess - Step 1 - Task 1"
          }
      ]
  }
  var eventStr = JSON.stringify(event);
  unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call stop simulation method in Unity
});