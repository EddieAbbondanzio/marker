import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return () => {
      return (<div id="app"><router-view /></div>)
    }
  }
})