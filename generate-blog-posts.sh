#!/bin/bash

# This script generates individual HTML files for each blog post
# Run this script whenever you add a new blog post to blog-data.js

echo "Generating blog post pages..."

# Create blog directory if it doesn't exist
mkdir -p blog

# Copy template for each blog post
# You'll need to manually create these based on the blog post IDs in blog-data.js
# Or use a Node.js script to automate this

# For now, create the three existing posts
posts=("diy-llm" "create-more-than-consume" "witness-to-my-life")

for post in "${posts[@]}"
do
    cp blog-post-template.html "blog/${post}.html"
    echo "Created blog/${post}.html"
done

echo "Done! Blog post pages created in the blog/ directory"
echo ""
echo "Next steps:"
echo "1. Set up Giscus for comments:"
echo "   - Go to https://giscus.app/"
echo "   - Follow the setup instructions"
echo "   - Replace YOUR_REPO_ID and YOUR_CATEGORY_ID in each blog post HTML file"
echo ""
echo "2. Deploy your site to GitHub Pages"
echo ""
echo "3. Optional: Set up a proper analytics backend for view tracking"
echo "   - Current implementation uses localStorage (client-side only)"
echo "   - Consider using PostHog, Plausible, or a custom backend"