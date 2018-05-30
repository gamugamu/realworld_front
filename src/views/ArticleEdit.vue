<template>
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <RwvListErrors :errors="errors"/>
          <form v-on:submit.prevent="onPublish(article.slug, article)">
            <fieldset :disabled="inProgress">
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control form-control-lg"
                  v-model="article.title"
                  placeholder="Article Title">
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  v-model="article.description"
                  placeholder="What's this article about?">
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  class="form-control"
                  rows="8"
                  v-model="article.body"
                  placeholder="Write your article (in markdown)">
                </textarea>
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Enter tags"
                  v-model="tagInput"
                  v-on:keypress.enter.prevent="addTag(tagInput)">
                <div class="tag-list">
                  <span
                    class="tag-default tag-pill"
                    v-for="(tag, index) of article.tagList"
                    :key="tag + index">
                  <i
                    class="ion-close-round"
                    v-on:click="removeTag(tag)">
                </i>
                {{ tag }}
              </span>
                </div>
              </fieldset>
            </fieldset>
            <button
              :disabled="inProgress"
              class="btn btn-lg pull-xs-right btn-primary"
              type="submit">
              Publish Article
            </button>
          </form>
            <input id="fileupload" type="file" @change="previewImage" accept="image/*" />
            <div class="image-preview" v-if="imageData.length > 0">
              <img class="preview" :src="imageData">
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import store from '@/store'
  import RwvListErrors from '@/components/ListErrors'

  import {
    ARTICLE_PUBLISH,
    ARTICLE_EDIT,
    FETCH_ARTICLE,
    ARTICLE_EDIT_ADD_TAG,
    ARTICLE_EDIT_REMOVE_TAG,
    ARTICLE_RESET_STATE
  } from '@/store/actions.type'

  export default {
    name: 'RwvArticleEdit',
    components: { RwvListErrors },
    props: {
      previousArticle: {
        type: Object,
        required: false
      }
    },
    async beforeRouteUpdate (to, from, next) {
      // Reset state if user goes from /editor/:id to /editor
      // The component is not recreated so we use to hook to reset the state.
      await store.dispatch(ARTICLE_RESET_STATE)
      return next()
    },
    async beforeRouteEnter (to, from, next) {
      // SO: https://github.com/vuejs/vue-router/issues/1034
      // If we arrive directly to this url, we need to fetch the article
      await store.dispatch(ARTICLE_RESET_STATE)
      if (to.params.slug !== undefined) {
        await store.dispatch(FETCH_ARTICLE,
          to.params.slug,
          to.params.previousArticle
        )
      }
      return next()
    },
    async beforeRouteLeave (to, from, next) {
      await store.dispatch(ARTICLE_RESET_STATE)
      next()
    },
    data () {
      return {
        imageData: {},
        tagInput: null,
        inProgress: false,
        errors: {}
      }
    },
    computed: {
      ...mapGetters([
        'article'
      ])
    },
    methods: {
      onPublish (slug, article) {
        let action = slug ? ARTICLE_EDIT : ARTICLE_PUBLISH
        this.inProgress = true
        this.$store
          .dispatch(action)
          .then(({ data }) => {
            this.inProgress = false
            this.$router.push({
              name: 'article',
              params: { slug: data.article.slug }
            })
          })
          .catch(({ response }) => {
            this.inProgress = false
            this.errors = response.data.errors
          })
      },
      previewImage (event) {
        var input = event.target
        console.log('XX---> ', event.target.files)

        if (input.files && input.files[0]) {
          // create a new FileReader to read this image and convert to base64 format
          var reader = new FileReader()
          // Define a callback function to run, when FileReader finishes its job
          reader.onload = (e) => {
            // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
            // Read image as base64 and set to imageData
            this.imageData = e.target.result
            try {
              var Minio = require('minio')

              console.log('*** minio service')

              // file
              var minioClient = new Minio.Client({
                endPoint: 'localhost',
                port: 9000,
                secure: false,
                accessKey: 'AKIAIOSFODNN7EXAMPLE', // domaine restriction par nginx
                secretKey: 'SECRETSECRET'
              })

              console.log('*** minio service', minioClient)
              console.log('---> ', input.files[0])

              // Make a bucket called europetrip.
              minioClient.makeBucket('blogimage', 'eu-west-3', function (err) {
                console.log('will make bucket')

                if (err) {
                  return console.log('error', err)
                }
                console.log('Bucket created successfully in "us-east-1".')
              })

              minioClient.putObject('blogimage', 'hellofile.jpg', this.imageData, function (err, etag) {
                console.log('PUT***')
                console.log(err, etag)
                return console.log(err, etag) // err should be null
              })
            } catch (err) {
              console.log('X ---> ', err, err.message)
            }
          }
          // Start the reader job - read file as a data url (base64 format)
          reader.readAsDataURL(input.files[0])
        }
      },
      removeTag (tag) {
        this.$store.dispatch(ARTICLE_EDIT_REMOVE_TAG, tag)
      },
      addTag (tag) {
        this.$store.dispatch(ARTICLE_EDIT_ADD_TAG, tag)
        this.tagInput = null
      }
    }
  }
</script>
