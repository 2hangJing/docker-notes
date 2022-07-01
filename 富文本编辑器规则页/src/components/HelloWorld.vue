<template>
  <div id="wrap">
    <div class="edit">
      <button @click="getData">查看值</button>
      <am-toolbar v-if="engine" :engine="engine" :items="items" />
      <div ref="container"></div>
    </div>
    <div class="view" v-html="viewHtml"></div>
  </div>
</template>

<script>
import Engine from "@aomao/engine";
import AmToolbar, { ToolbarPlugin, ToolbarComponent } from "am-editor-toolbar-vue2";
import Codeblock, { CodeBlockComponent } from 'am-editor-codeblock-vue2'
import Bold from '@aomao/plugin-bold'
import Heading from '@aomao/plugin-heading'
import Image , { ImageComponent , ImageUploader } from '@aomao/plugin-image';
import Table, { TableComponent } from '@aomao/plugin-table';
export default {
  name: "HelloWorld",
  components: {
    AmToolbar,
  },
  data: function () {
    return {
      engine: null,
      items: [['collapse'],['heading','bold']],
      viewHtml: ''
    };
  },
  props: {
    msg: String,
  },
  mounted() {
    const engine = new Engine(
		this.$refs.container,
		{
			// className: 'aaa',
			cards:[
			ToolbarComponent,
			CodeBlockComponent,
			ImageComponent,
			TableComponent
			],
			plugins: [
			Heading,
			ToolbarPlugin,
			Codeblock,
			Bold,
			Image, 
			ImageUploader,
			Table
			],
			config:{
				[ImageUploader.pluginName]:{
					file:{
						action: 'https://api-test-h5.micoworld.net/api/activity/common/upload/image',
						crossOrigin: true,
						headers: {
							key: `YMbWYTCTQltgmXRC7lQKWIsd7sDPpQeWW7wHTV191Es%3D`
						}
					},
					parse: (response)=> {
						console.log( 'response', response );
						return {
							result: true,
							data: {
								url: response.data
							}
						}
					}
				}
			}
		},
	);
    console.log(engine)
    this.engine = engine;
  },
  methods:{
    getData(){
      // 剔除无用的属性
      this.viewHtml = this.engine.getHtml().replaceAll(/(style=\"(.*?)\")|(data-id=\"(.*?)\")|(data-transient-attributes=\"(.*?)\")/g, '');
      // 最外层 dom class 替换，避免 class 污染
      this.viewHtml = this.viewHtml.replace('class="am-engine"', 'id="ruleWrap"');

      console.log( 'viewHtml----', this.viewHtml );
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#wrap{
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}
.view,.edit{
  width: 375px;
}
.view{
  border: 1px solid #eee;
  font-size: 100px;
  padding: 40px;
}
.edit{
    padding: 15px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
p,div{
  margin: 0;
}
#ruleWrap p{
  font-size: 14px;
  font-weight: 600;
  color: #903B12;
  line-height: 19px;
}
</style>
